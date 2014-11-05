/**
 * ForceJS - REST toolkit for Salesforce.com
 * Author: Christophe Coenraets @ccoenraets
 * Version: 0.4
 */
var force = (function () {

    "use strict";

    var loginURL = 'https://login.salesforce.com',

    // The Connected App client Id. Default app id provided - Not for production use.
        appId = '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',

    // The force.com API version to use. Default can be overriden in login()
        apiVersion = 'v32.0',

    // Keep track of OAuth data (mainly access_token and refresh_token)
        oauth,

    // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
        proxyURL = "http://localhost:8200",

    // By default we store fbtoken in sessionStorage. This can be overridden in init()
        tokenStore = {},

    // if page URL is http://localhost:3000/myapp/index.html, context is /myapp
        context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")),

    // if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
        baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '') + context,

    // if page URL is http://localhost:3000/myapp/index.html, oauthCallbackURL is http://localhost:3000/myapp/oauthcallback.html
        oauthCallbackURL = baseURL + '/oauthcallback.html',

    // Because the OAuth login spans multiple processes, we need to keep the login success and error handlers as a variables
    // inside the module instead of keeping them local within the login function.
        loginSuccessHandler,
        loginErrorHandler,

    // Indicates if the app is running inside Cordova
        oauthPlugin;

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
                console.log('Error refreshing oauth access token using the oauth plugin');
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

            url = oauthPlugin ? loginURL : proxyURL;

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
        if (!oauthPlugin) {
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

        console.log(params);

        // Load previously saved token
        if (tokenStore.forceOAuth) {
            oauth = JSON.parse(tokenStore.forceOAuth);
        }

        if (params) {
            appId = params.appId || appId;
            apiVersion = params.apiVersion || apiVersion;
            tokenStore = params.tokenStore || tokenStore;
            loginURL = params.loginURL || loginURL;
            oauthCallbackURL = params.oauthCallbackURL || oauthCallbackURL;
            proxyURL = params.proxyURL || proxyURL;

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
                    console.log(JSON.stringify(creds));
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
    function isLoggedIn() {
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
            url = oauthPlugin ? oauth.instance_url : proxyURL;

        // dev friendly API: Remove trailing '/' if any so url + path concat always works
        if (url.slice(-1) === '/') {
            url = url.slice(0, -1);
        }

        // dev friendly API: Add leading '/' if missing so url + path concat always works
        if (obj.path.charAt(0) !== '/') {
            obj.path = '/' + obj.path;
        }

        url = url + obj.path;

        if (obj.params) {
            url += '?' + toQueryString(obj.params);
        }

        console.log(url);

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
        if (!oauthPlugin) {
            xhr.setRequestHeader("Target-URL", oauth.instance_url);
        }
        xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);
    }

    /**
     * Execute a SOQL query
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
     * Retrieve a single record based on its Id
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
     * Create a new record
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
     * Update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
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
     * Delete a record
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
     * Upsert a record
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

    // The public API
    return {
        init: init,
        login: login,
        getUserId: getUserId,
        isLoggedIn: isLoggedIn,
        request: request,
        query: query,
        create: create,
        update: update,
        del: del,
        upsert: upsert,
        retrieve: retrieve,
        discardToken: discardToken,
        oauthCallback: oauthCallback
    };

}());
