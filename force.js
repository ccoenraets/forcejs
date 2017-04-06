/*
 * Copyright (c) 2016-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * ForceJS - REST toolkit for Salesforce.com
 * Author: Christophe Coenraets @ccoenraets
 * Version: 1.0
 */
var force = (function () {

    "use strict";

    // The login URL for the OAuth process
    // To override default, pass loginURL in init(props)
    var loginURL = 'https://login.salesforce.com',

    // The Connected App client Id. Default app id provided - Not for production use.
    // This application supports http://localhost:8200/oauthcallback.html as a valid callback URL
    // To override default, pass appId in init(props)
        appId = '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',

    // The force.com API version to use.
    // To override default, pass apiVersion in init(props)
        apiVersion = 'v39.0',

    // Keep track of OAuth data (access_token, refresh_token, instance_url and user_id)
        oauth,

    // By default we store fbtoken in sessionStorage. This can be overridden in init()
        tokenStore = {},

    // if page URL is http://localhost:3000/myapp/index.html, context is /myapp
        context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")),

    // if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
        serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),

    // if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
        baseURL = serverURL + context,

    // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
    // To override default, pass proxyURL in init(props)
        proxyURL = baseURL,

    // if page URL is http://localhost:3000/myapp/index.html, oauthCallbackURL is http://localhost:3000/myapp/oauthcallback.html
    // To override default, pass oauthCallbackURL in init(props)
        oauthCallbackURL = baseURL + '/oauthcallback.html',

    // Because the OAuth login spans multiple processes, we need to keep the login success and error handlers as a variables
    // inside the module instead of keeping them local within the login function.
        loginSuccessHandler,
        loginErrorHandler,

    // Reference to the Salesforce OAuth plugin
        oauthPlugin,

    // Reference to the Salesforce Network plugin
        networkPlugin,

    // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
    // or using the Salesforce console. Can be overriden in init()
        useProxy = (window.cordova || window.SfdcApp || window.sforce) ? false : true,

    // Where or not to use cordova for oauth and network calls
        useCordova = window.cordova ? true : false,

    // Testing only
       requestHandler;
        

    /*
     * Determines the request base URL.
     */
    function getRequestBaseURL() {

        var url;

        if (useProxy) {
            url = proxyURL;
        } else if (oauth.instance_url) {
            url = oauth.instance_url;
        } else {
            url = serverURL;
        }

        // dev friendly API: Remove trailing '/' if any so url + path concat always works
        if (url.slice(-1) === '/') {
            url = url.slice(0, -1);
        }

        return url;
    }

    function parseQueryString(queryString) {
        if ((queryString || '') === '') {
            return {};
        }

        var qs = queryString.charAt(0) === '?' ? queryString.substring(1) : queryString;
        var obj = {};
        var params = qs.split('&');
        params.forEach(function (param) {
            var splitter = param.split('=');
            if (splitter.length == 2) {
                obj[decodeURIComponent(splitter[0])] = decodeURIComponent(splitter[1]);
            }
        });
        return obj;
    }

    function toQueryString(obj) {
        var parts = [],
            i;
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    function parseUrl(url) {
        var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([^?#]*)(\?[^#]*|)(#.*|)$/);
        return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            path: match[5],
            params: parseQueryString(match[6]),
            hash: match[7]
        };
    }

    function refreshTokenWithPlugin(success, error) {

        oauthPlugin.authenticate(
            function (response) {
                oauth.access_token = response.accessToken;
                tokenStore.forceOAuth = JSON.stringify(oauth);
                if (typeof success === "function") {
                    success();
                }
            },
            function () {
                console.error('Error refreshing oauth access token using the oauth plugin');
                if (typeof error === "function") {
                    error();
                }
            }
        );
    }

    function refreshTokenWithHTTPRequest(success, error) {

        if (!oauth.refresh_token) {
            console.log('ERROR: refresh token does not exist');
            if (typeof error === "function") {
                error();
            }
            return;
        }

        var xhr = new XMLHttpRequest(),

            params = {
                'grant_type': 'refresh_token',
                'refresh_token': oauth.refresh_token,
                'client_id': appId
            },

            url = useProxy ? proxyURL : loginURL;

        url = url + '/services/oauth2/token?' + toQueryString(params);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    console.log('Token refreshed');
                    var res = JSON.parse(xhr.responseText);
                    oauth.access_token = res.access_token;
                    tokenStore.forceOAuth = JSON.stringify(oauth);
                    if (typeof success === "function") {
                        success();
                    }
                } else {
                    console.log('Error while trying to refresh token: ' + xhr.responseText);
                    if (typeof error === "function") {
                        error();
                    }
                }
            }
        };

        xhr.open('POST', url, true);
        if (!useProxy) {
            xhr.setRequestHeader("Target-URL", loginURL);
        }
        xhr.send();
    }

    function refreshToken(success, error) {
        if (oauthPlugin) {
            refreshTokenWithPlugin(oauthPlugin, success, error);
        } else {
            refreshTokenWithHTTPRequest(success, error);
        }
    }

    /**
     * Initialize ForceJS
     * @param params
     *  appId (optional)
     *  loginURL (optional)
     *  proxyURL (optional)
     *  oauthCallbackURL (optional)
     *  apiVersion (optional)
     *  accessToken (optional)
     *  instanceURL (optional)
     *  refreshToken (optional)
     *  useCordova (optional)
     *  requestHandler (testing only)
     */
    function init(params) {

        if (params) {
            appId = params.appId || appId;
            apiVersion = params.apiVersion || apiVersion;
            loginURL = params.loginURL || loginURL;
            oauthCallbackURL = params.oauthCallbackURL || oauthCallbackURL;
            proxyURL = params.proxyURL || proxyURL;
            useProxy = params.useProxy === undefined ? useProxy : params.useProxy;
            useCordova = params.useCordova === undefined ? useCordova : params.useCordova;

            if (params.accessToken) {
                if (!oauth) oauth = {};
                oauth.access_token = params.accessToken;
            }

            if (params.instanceURL) {
                if (!oauth) oauth = {};
                oauth.instance_url = params.instanceURL;
            }

            if (params.refreshToken) {
                if (!oauth) oauth = {};
                oauth.refresh_token = params.refreshToken;
            }

            if (params.userId) {
                if (!oauth) oauth = {};
                oauth.user_id = params.userId;
            }

            // Testing only - to set (or unset) requestHandler
            requestHandler = params.requestHandler;
        }

        console.log("useProxy: " + useProxy);

    }

    /**
     * Discard the OAuth access_token. Use this function to test the refresh token workflow.
     */
    function discardToken() {
        delete oauth.access_token;
        tokenStore.forceOAuth = JSON.stringify(oauth);
    }

    /**
     * Called internally either by oauthcallback.html
     * @param url - The oauthRedictURL called by Salesforce at the end of the OAuth workflow. Includes the access_token in the querystring
     */
    function oauthCallback(url) {

        // Parse the OAuth data received from Facebook
        var queryString,
            obj;

        if (url.indexOf("access_token=") > 0) {
            queryString = url.substr(url.indexOf('#') + 1);
            obj = parseQueryString(queryString);
            oauth = obj;
            // Paring out user id
            oauth.user_id = oauth.id.split('/').pop();
            tokenStore.forceOAuth = JSON.stringify(oauth);
            if (loginSuccessHandler) {
                loginSuccessHandler();
            }
        } else if (url.indexOf("error=") > 0) {
            queryString = decodeURIComponent(url.substring(url.indexOf('?') + 1));
            obj = parseQueryString(queryString);
            if (loginErrorHandler) {
                loginErrorHandler(obj);
            }
        } else {
            if (loginErrorHandler) {
                loginErrorHandler({status: 'access_denied'});
            }
        }
    }

    /**
     * Login to Salesforce using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     * If running in Cordova container, it happens using the Mobile SDK 2.3+ Oauth Plugin
     * @param successHandler - function to call back when login succeeds
     * @param errorHandler - function to call back when login fails
     */
    function login(successHandler, errorHandler) {
        if (useCordova) {
            loginWithPlugin(successHandler, errorHandler);
        } else {
            loginWithBrowser(successHandler, errorHandler);
        }
    }

    function loginWithPlugin(successHandler, errorHandler) {
        document.addEventListener("deviceready", function () {
            try {
                oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
                networkPlugin = cordova.require("com.salesforce.plugin.network");
            } catch(e) {
                // fail silently
            }
            if (!oauthPlugin) {
                console.error('Salesforce Mobile SDK OAuth plugin not available');
                errorHandler('Salesforce Mobile SDK OAuth plugin not available');
                return;
            }
            oauthPlugin.getAuthCredentials(
                function (creds) {
                    // Initialize ForceJS
                    init({accessToken: creds.accessToken, instanceURL: creds.instanceUrl, refreshToken: creds.refreshToken});
                    if (typeof successHandler === "function") successHandler();
                },
                function (error) {
                    console.log(error);
                    if (typeof errorHandler === "function") errorHandler(error);
                }
            );
        }, false);
    }

    function loginWithBrowser(successHandler, errorHandler) {
        console.log('loginURL: ' + loginURL);
        console.log('oauthCallbackURL: ' + oauthCallbackURL);

        var loginWindowURL = loginURL + '/services/oauth2/authorize?client_id=' + appId + '&redirect_uri=' +
            oauthCallbackURL + '&response_type=token';
        loginSuccessHandler = successHandler;
        loginErrorHandler = errorHandler;
        window.open(loginWindowURL, '_blank', 'location=no');
    }

    /**
     * Gets the user's ID (if logged in)
     * @returns {string} | undefined
     */
    function getUserId() {
        return (typeof(oauth) !== 'undefined') ? oauth.user_id : undefined;
    }

    /**
     * Check the login status
     * @returns {boolean}
     */
    function isAuthenticated() {
        return (oauth && oauth.access_token) ? true : false;
    }

    /**
     * Lets you make any Salesforce REST API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in to the Salesforce endpoint - Required
     *  params:  queryString parameters as a map - Optional
     *  data:  JSON object to send in the request body - Optional
     *  headerParams: parameters to send as header values for POST/PATCH etc - Optional
     * @param successHandler - function to call back when request succeeds - Optional
     * @param errorHandler - function to call back when request fails - Optional
     */
    function request(obj, successHandler, errorHandler) {
        if (typeof requestHandler === "function") {
            return requestHandler(obj);
        }
        
        // NB: networkPlugin will be defined only if login was done through plugin and container is using Mobile SDK 5.0 or above
        if (networkPlugin) { 
            requestWithPlugin(obj, successHandler, errorHandler);
        } else {
            requestWithBrowser(obj, successHandler, errorHandler);
        }
    }        

    /**
     * @param path: full path or path relative to end point - required
     * @param endPoint: undefined or endpoint - optional
     * @return object with {endPoint:XX, path:relativePathToXX}
     *
     * For instance for undefined, '/services/data'     => {endPoint:'/services/data', path:'/'}
     *                  undefined, '/services/apex/abc' => {endPoint:'/services/apex', path:'/abc'}
     *                  '/services/data, '/versions'    => {endPoint:'/services/data', path:'/versions'}
     */
    function computeEndPointIfMissing(endPoint, path) {
        if (endPoint !== undefined) {
            return {endPoint:endPoint, path:path};
        }
        else {
            var parts = path.split('/').filter(function(s) { return s !== ""; });
            if (parts.length >= 2) {
                return {endPoint: '/' + parts.slice(0,2).join('/'), path: '/' + parts.slice(2).join('/')};
            }
            else {
                return {endPoint: '', path:path};
            }
        }
    }

    function requestWithPlugin(obj, successHandler, errorHandler) {
        var obj2 = computeEndPointIfMissing(obj.endPoint, obj.path);
        networkPlugin.sendRequest(obj2.endPoint, obj2.path, successHandler, errorHandler, obj.method, obj.data || obj.params, obj.headerParams);        
    }

    function requestWithBrowser(obj, successHandler, errorHandler) {
        if (!oauth || (!oauth.access_token && !oauth.refresh_token)) {
            if (typeof errorHandler === "function") {
                errorHandler('No access token. Login and try again.');
            }
            return;
        }

        var method = obj.method || 'GET',
            xhr = new XMLHttpRequest(),
            url = getRequestBaseURL();

        // dev friendly API: Add leading '/' if missing so url + path concat always works
        if (obj.path.charAt(0) !== '/') {
            obj.path = '/' + obj.path;
        }

        url = url + obj.path;

        if (obj.params) {
            url += '?' + toQueryString(obj.params);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status > 199 && xhr.status < 300) {
                    if (typeof successHandler === "function") {
                        successHandler(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
                    }
                } else if (xhr.status === 401 && oauth.refresh_token) {
                    refreshToken(
                        function () {
                            // Try again with the new token
                            request(obj, successHandler, errorHandler);
                        },
                        function () {
                            console.error(xhr.responseText);
                            var error = xhr.responseText ? JSON.parse(xhr.responseText) : {message: 'An error has occurred'};
                            if (typeof errorHandler === "function") {
                                errorHandler(error);
                            }
                        }
                    );
                } else {
                    console.error(xhr.responseText);
                    var error = xhr.responseText ? JSON.parse(xhr.responseText) : {message: 'An error has occurred'};
                    if (typeof errorHandler === "function") {
                        errorHandler(error);
                    }
                }
            }
        };

        xhr.open(method, url, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + oauth.access_token);
        xhr.setRequestHeader('Cache-Control', 'no-store');
        // See http://www.salesforce.com/us/developer/docs/chatterapi/Content/intro_requesting_bearer_token_url.htm#kanchor36
        xhr.setRequestHeader("X-Connect-Bearer-Urls", true);

        if (obj.contentType) {
            xhr.setRequestHeader("Content-Type", obj.contentType);
        }
        if (obj.headerParams) {
            for (var headerName in obj.headerParams.getOwnPropertyNames()) {
                var headerValue = obj.headerParams[headerName];
                xhr.setRequestHeader(headerName, headerValue);
            }
        }
        if (useProxy) {
            xhr.setRequestHeader("Target-URL", oauth.instance_url);
        }
        xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);
    }

    /*
     * Lists summary information about each Salesforce.com version currently
     * available, including the version, label, and a link to each version's
     * root.
     * @param successHandler
     * @param errorHandler
     */
    function versions(successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/',
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Lists available resources for the client's API version, including
     * resource name and URI.
     * @param successHandler
     * @param errorHandler
     */
    function resources(successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion,
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Lists the available objects and their metadata for your organization's
     * data.
     * @param successHandler
     * @param errorHandler
     */
    function describeGlobal(successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects',
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Describes the individual metadata for the specified object.
     * @param objectName object name; e.g. "Account"
     * @param successHandler
     * @param errorHandler
     */
    function metadata(objectName, successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName,
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Completely describes the individual metadata at all levels for the
     * specified object.
     * @param objectName object name; e.g. "Account"
     * @param successHandler
     * @param errorHandler
     */
    function describe(objectName, successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/describe',
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Fetches the layout configuration for a particular sobject name and record type id.
     * @param objectName object name; e.g. "Account"
     * @param (Optional) recordTypeId Id of the layout's associated record type
     * @param successHandler
     * @param errorHandler
     */
    function describeLayout(objectName, recordTypeId, successHandler, errorHandler) {
        recordTypeId = recordTypeId || '';
        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/describe/layouts/' + recordTypeId,
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to execute a SOQL query
     * @param soql
     * @param successHandler
     * @param errorHandler
     */
    function query(soql, successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion + '/query',
                params: {q: soql}
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Queries the next set of records based on pagination.
     * This should be used if performing a query that retrieves more than can be returned
     * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm
     *
     * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
     * @param successHandler
     * @param errorHandler
     */
    function queryMore(url, successHandler, errorHandler){

        var obj = parseUrl(url);

        return request(
            {
                path: obj.path,
                params: obj.parans
            },
            successHandler,
            errorHandler
        );
    }

    /*
     * Executes the specified SOSL search.
     * @param sosl a string containing the search to execute - e.g. "FIND
     *             {needle}"
     * @param successHandler
     * @param errorHandler
     */
    function search(sosl, successHandler, errorHandler) {
        return request(
            {
                path: '/services/data/' + apiVersion + '/search',
                params: {q: sosl}
            },
            successHandler,
            errorHandler
        );
    }
    
    /**
     * Convenience function to retrieve a single record based on its Id
     * @param objectName
     * @param id
     * @param fields
     * @param successHandler
     * @param errorHandler
     */
    function retrieve(objectName, id, fields, successHandler, errorHandler) {

        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
                params: fields ? {fields: (typeof fields === "string" ? fields : fields.join(","))} : undefined
            },
            successHandler,
            errorHandler
        );

    }
    
    /**
     * Convenience function to retrieve an attachment
     * @param id 
     * @param successHandler
     * @param errorHandler
     */
    function getAttachment(id, successHandler, errorHandler){
        requestBinary(
            {
                path: '/services/data/' + apiVersion + '/sobjects/Attachment/' + id + '/Body'
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to retrieve picklist values from a SalesForce Field
     * @param objectName
     * @param successHandler
     * @param errorHandler
     */
    function getPickListValues(objectName, successHandler, errorHandler){
        return request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/describe'
            },
            successHandler,
            errorHandler
        );
    }
    

    /**
     * Convenience function to create a new record
     * @param objectName
     * @param data
     * @param success
     * @param error
     */
    function create(objectName, data, successHandler, errorHandler) {
        return request(
            {
                method: 'POST',
                contentType: 'application/json',
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/',
                data: data
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
     * @param objectName
     * @param data The object to update. Must include the Id field.
     * @param successHandler
     * @param errorHandler
     */
    function update(objectName, data, successHandler, errorHandler) {

        var id = data.Id || data.id,
            fields = JSON.parse(JSON.stringify(data));

        delete fields.attributes;
        delete fields.Id;
        delete fields.id;

        return request(
            {
                method: 'PATCH',
                contentType: 'application/json',
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
                data: fields
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to delete a record
     * @param objectName
     * @param id
     * @param success
     * @param error
     */
    function del(objectName, id, successHandler, errorHandler) {

        return request(
            {
                method: 'DELETE',
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to upsert a record
     * @param objectName
     * @param externalIdField
     * @param externalId
     * @param data
     * @param success
     * @param error
     */
    function upsert(objectName, externalIdField, externalId, data, successHandler, errorHandler) {

        return request(
            {
                method: 'PATCH',
                contentType: 'application/json',
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + externalIdField + '/' + externalId,
                data: data
            },
            successHandler,
            errorHandler
        );
    }

    /**
     * Convenience function to invoke APEX REST endpoints
     * @param pathOrParams
     * @param successHandler
     * @param errorHandler
     */
    function apexrest(pathOrParams, successHandler, errorHandler) {

        var obj;

        if (typeof pathOrParams === "string") {
            obj = {path: pathOrParams, method: "GET"};
        } else {
            obj = pathOrParams;

            if (obj.path.charAt(0) !== "/") {
                obj.path = "/" + obj.path;
            }

            if (obj.path.substr(0, 18) !== "/services/apexrest") {
                obj.path = "/services/apexrest" + obj.path;
            }
        }

        if (!obj.contentType) {
            obj.contentType = (obj.method == "DELETE" || obj.method == "GET" ? null : 'application/json');
        }

        return request(obj, successHandler, errorHandler);
    }

    /**
     * Convenience function to invoke the Chatter API
     * @param pathOrParams
     * @param successHandler
     * @param errorHandler
     */
    function chatter(params, successHandler, errorHandler) {

        var base = "/services/data/" + apiVersion + "/chatter";

        if (!params || !params.path) {
            errorHandler("You must specify a path for the request");
            return;
        }

        if (params.path.charAt(0) !== "/") {
            params.path = "/" + params.path;
        }

        params.path = base + params.path;

        return request(params, successHandler, errorHandler);

    }
    
    // The public API
    return {
        apiVersion: apiVersion,
        init: init,
        login: login,
        getUserId: getUserId,
        isAuthenticated: isAuthenticated,
        request: request,
        versions: versions,
        resources: resources,
        describeGlobal: describeGlobal,
        metadata: metadata,
        describe: describe,
        describeLayout: describeLayout,
        query: query,
        queryMore: queryMore,
        search: search,
        create: create,
        update: update,
        del: del,
        upsert: upsert,
        retrieve: retrieve,
        apexrest: apexrest,
        chatter: chatter,
        discardToken: discardToken,
        oauthCallback: oauthCallback,
        getPickListValues: getPickListValues,
        getAttachment: getAttachment,
        getRequestBaseURL: getRequestBaseURL,

        // Exposed for testing only
        computeEndPointIfMissing: computeEndPointIfMissing,
        parseUrl: parseUrl
    };

}());

