/**
 * ForceJS - REST toolkit for Salesforce.com
 * Author: Christophe Coenraets @ccoenraets
 * Version: 0.6
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
        apiVersion = 'v33.0',

    // Keep track of OAuth data (access_token, refresh_token, and instance_url)
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

    // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
    // or using the Salesforce console. Can be overriden in init()
        useProxy = (window.cordova || window.SfdcApp || window.sforce) ? false : true;

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
        var qs = decodeURIComponent(queryString),
            obj = {},
            params = qs.split('&');
        params.forEach(function (param) {
            var splitter = param.split('=');
            obj[splitter[0]] = splitter[1];
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

    function refreshTokenWithPlugin(success, error) {

        oauthPlugin.authenticate(
            function (response) {
                oauth.access_token = response.accessToken;
                tokenStore.forceOAuth = JSON.stringify(oauth);
                if (success) {
                    success();
                }
            },
            function () {
                console.error('Error refreshing oauth access token using the oauth plugin');
                if (error) {
                    error();
                }
            }
        );
    }

    function refreshTokenWithHTTPRequest(success, error) {

        if (!oauth.refresh_token) {
            console.log('ERROR: refresh token does not exist');
            if (error) {
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
                    if (success) {
                        success();
                    }
                } else {
                    console.log('Error while trying to refresh token: ' + xhr.responseText);
                    if (error) {
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
     */
    function init(params) {

        if (params) {
            appId = params.appId || appId;
            apiVersion = params.apiVersion || apiVersion;
            loginURL = params.loginURL || loginURL;
            oauthCallbackURL = params.oauthCallbackURL || oauthCallbackURL;
            proxyURL = params.proxyURL || proxyURL;
            useProxy = params.useProxy === undefined ? useProxy : params.useProxy;

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
        if (window.cordova) {
            loginWithPlugin(successHandler, errorHandler);
        } else {
            loginWithBrowser(successHandler, errorHandler);
        }
    }

    function loginWithPlugin(successHandler, errorHandler) {
        document.addEventListener("deviceready", function () {
            oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
            if (!oauthPlugin) {
                console.error('Salesforce Mobile SDK OAuth plugin not available');
                errorHandler('Salesforce Mobile SDK OAuth plugin not available');
                return;
            }
            oauthPlugin.getAuthCredentials(
                function (creds) {
                    // Initialize ForceJS
                    init({accessToken: creds.accessToken, instanceURL: creds.instanceUrl, refreshToken: creds.refreshToken});
                    if (successHandler) successHandler();
                },
                function (error) {
                    console.log(error);
                    if (errorHandler) errorHandler(error);
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
        return (typeof(oauth) !== 'undefined') ? oauth.id.split('/').pop() : undefined;
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
     * @param successHandler - function to call back when request succeeds - Optional
     * @param errorHandler - function to call back when request fails - Optional
     */
    function request(obj, successHandler, errorHandler) {

        if (!oauth || (!oauth.access_token && !oauth.refresh_token)) {
            if (errorHandler) {
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
                    if (successHandler) {
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
                            if (errorHandler) {
                                errorHandler(error);
                            }
                        }
                    );
                } else {
                    console.error(xhr.responseText);
                    var error = xhr.responseText ? JSON.parse(xhr.responseText) : {message: 'An error has occurred'};
                    if (errorHandler) {
                        errorHandler(error);
                    }
                }
            }
        };

        xhr.open(method, url, true);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Authorization", "Bearer " + oauth.access_token);
        if (obj.contentType) {
            xhr.setRequestHeader("Content-Type", obj.contentType);
        }
        if (useProxy) {
            xhr.setRequestHeader("Target-URL", oauth.instance_url);
        }
        xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);
    }

    /**
     * Convenience function to execute a SOQL query
     * @param soql
     * @param successHandler
     * @param errorHandler
     */
    function query(soql, successHandler, errorHandler) {
        request(
            {
                path: '/services/data/' + apiVersion + '/query',
                params: {q: soql}
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
     * @param success
     * @param error
     */
    function retrieve(objectName, id, fields, success, error) {

        request(
            {
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
                params: fields ? {fields: fields} : undefined
            },
            success,
            error
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
        request(
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
        request(
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

        request(
            {
                method: 'POST',
                contentType: 'application/json',
                path: '/services/data/' + apiVersion + '/sobjects/' + objectName + '/' + id,
                params: {'_HttpMethod': 'PATCH'},
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

        request(
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

        request(
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

        var params;

        if (pathOrParams.substring) {
            params = {path: pathOrParams};
        } else {
            params = pathOrParams;

            if (params.path.charAt(0) !== "/") {
                params.path = "/" + params.path;
            }

            if (params.path.substr(0, 18) !== "/services/apexrest") {
                params.path = "/services/apexrest" + params.path;
            }
        }

        request(params, successHandler, errorHandler);
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

        request(params, successHandler, errorHandler);

    }

    // The public API
    return {
        init: init,
        login: login,
        getUserId: getUserId,
        isAuthenticated: isAuthenticated,
        request: request,
        query: query,
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
        getAttachment: getAttachment
    };

}());
