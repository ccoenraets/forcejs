(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["force"] = factory();
	else
		root["force"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = {
		OAuth: __webpack_require__(1),
		DataService: __webpack_require__(2)
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * forcejs - REST toolkit for Salesforce.com
	 * forcejs/oauth - OAuth User Agent Workflow module
	 * Author: Christophe Coenraets @ccoenraets
	 * Version: 2.0.1
	 */
	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var instanceCounter = 0;

	// if page URL is http://localhost:3000/myapp/index.html, context is /myapp
	var context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

	// if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
	var serverURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");

	// if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
	var baseURL = serverURL + context;

	// Reference to the Salesforce OAuth plugin
	var oauthPlugin = void 0;

	var getQueryStringAsObject = function getQueryStringAsObject(url) {
	    var obj = {};
	    var index = url.indexOf("#");
	    if (index > -1) {
	        var queryString = decodeURIComponent(url.substr(index + 1));
	        var params = queryString.split("&");
	        params.forEach(function (param) {
	            var splitter = param.split("=");
	            obj[splitter[0]] = splitter[1];
	        });
	    }
	    return obj;
	};

	module.exports = {
	    createInstance: function createInstance(appId, loginURL, oauthCallbackURL) {
	        return window.cordova ? new OAuthCordova(appId, loginURL, oauthCallbackURL) : new OAuthWeb(appId, loginURL, oauthCallbackURL);
	    }
	};

	var OAuth = function () {
	    function OAuth(appId, loginURL, oauthCallbackURL) {
	        _classCallCheck(this, OAuth);

	        instanceCounter = instanceCounter + 1;
	        this.instanceId = instanceCounter;
	        this.appId = appId || "3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92";
	        this.loginURL = loginURL || "https://login.salesforce.com";
	        this.oauthCallbackURL = oauthCallbackURL || baseURL + "/oauthcallback.html";
	    }

	    _createClass(OAuth, [{
	        key: "login",
	        value: function login() {}
	    }, {
	        key: "loginGuest",
	        value: function loginGuest() {}
	    }]);

	    return OAuth;
	}();

	var OAuthCordova = function (_OAuth) {
	    _inherits(OAuthCordova, _OAuth);

	    function OAuthCordova() {
	        _classCallCheck(this, OAuthCordova);

	        return _possibleConstructorReturn(this, (OAuthCordova.__proto__ || Object.getPrototypeOf(OAuthCordova)).apply(this, arguments));
	    }

	    _createClass(OAuthCordova, [{
	        key: "login",
	        value: function login() {
	            return new Promise(function (resolve, reject) {
	                document.addEventListener("deviceready", function () {
	                    oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
	                    if (!oauthPlugin) {
	                        console.error("Salesforce Mobile SDK OAuth plugin not available");
	                        reject("Salesforce Mobile SDK OAuth plugin not available");
	                        return;
	                    }
	                    oauthPlugin.getAuthCredentials(function (creds) {
	                        resolve({
	                            accessToken: creds.accessToken,
	                            instanceURL: creds.instanceUrl,
	                            refreshToken: creds.refreshToken,
	                            userId: creds.userId
	                        });
	                    }, function (error) {
	                        console.log(error);
	                        reject(error);
	                    });
	                }, false);
	            });
	        }
	    }]);

	    return OAuthCordova;
	}(OAuth);

	var OAuthWeb = function (_OAuth2) {
	    _inherits(OAuthWeb, _OAuth2);

	    function OAuthWeb() {
	        _classCallCheck(this, OAuthWeb);

	        return _possibleConstructorReturn(this, (OAuthWeb.__proto__ || Object.getPrototypeOf(OAuthWeb)).apply(this, arguments));
	    }

	    _createClass(OAuthWeb, [{
	        key: "login",
	        value: function login() {
	            var _this3 = this;

	            return new Promise(function (resolve, reject) {

	                console.log("loginURL: " + _this3.loginURL);
	                console.log("oauthCallbackURL: " + _this3.oauthCallbackURL);

	                document.addEventListener("oauthCallback", function (event) {

	                    var url = event.detail,
	                        oauthResult = getQueryStringAsObject(url);

	                    if (oauthResult.state == _this3.instanceId) {

	                        if (oauthResult.access_token) {
	                            resolve({
	                                appId: _this3.appId,
	                                accessToken: oauthResult.access_token,
	                                instanceURL: oauthResult.instance_url,
	                                refreshToken: oauthResult.refresh_token,
	                                userId: oauthResult.id.split("/").pop()
	                            });
	                        } else {
	                            reject(oauthResult);
	                        }
	                    }
	                });

	                var loginWindowURL = _this3.loginURL + ("/services/oauth2/authorize?client_id=" + _this3.appId + "&redirect_uri=" + _this3.oauthCallbackURL + "&response_type=token&state=" + _this3.instanceId);
	                window.open(loginWindowURL, "_blank", "location=no");
	            });
	        }
	    }]);

	    return OAuthWeb;
	}(OAuth);

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * forcejs - REST toolkit for Salesforce.com
	 * forcejs/data-service - Salesforce APIs data service module
	 * Author: Christophe Coenraets @ccoenraets
	 * Fork: David Hohl <david.hohl@capgemini.com>
	 * Version: 2.1.0
	 */
	"use strict";

	// if page URL is http://localhost:3000/myapp/index.html, context is /myapp

	var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

	// if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
	var serverURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");

	// if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
	var baseURL = serverURL + context;

	var joinPaths = function joinPaths(path1, path2) {
	    if (path1.charAt(path1.length - 1) !== "/") path1 = path1 + "/";
	    if (path2.charAt(0) === "/") path2 = path2.substr(1);
	    return path1 + path2;
	};

	var toQueryString = function toQueryString(obj) {
	    var encode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	    var parts = [],
	        i = void 0;
	    for (i in obj) {
	        if (obj.hasOwnProperty(i)) {
	            if (encode) {
	                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
	            } else {
	                parts.push(i + "=" + obj[i]);
	            }
	        }
	    }
	    return parts.join("&");
	};

	var parseUrl = function parseUrl(url) {
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
	};

	// Keeps track of single instance when instance is created with singleton form of createInstance:
	// createInstance(oauth, options) with no third parameter (name of the instance)
	var singleton = void 0;

	// Keeps track of named instances when app needs data from multiple Salesforce orgs. For example:
	// let org1 = ForceService.createInstance(oauth, options, "org1");
	// let org2 = ForceService.createInstance(oauth, options, "org2");
	var namedInstances = {};

	// Reference to the Salesforce Network plugin
	var networkPlugin = void 0;

	document.addEventListener("deviceready", function () {
	    try {
	        networkPlugin = cordova.require("com.salesforce.plugin.network");
	    } catch (e) {
	        // fail silently
	    }
	}, false);

	module.exports = {

	    createInstance: function createInstance(oauth, options, name) {
	        var instance = void 0;
	        if (window.cordova) {
	            instance = new ForceServiceCordova(oauth, options);
	        } else {
	            instance = new ForceServiceWeb(oauth, options);
	        }
	        if (name) {
	            namedInstances[name] = instance;
	        } else {
	            singleton = instance;
	        }
	        return instance;
	    },

	    getInstance: function getInstance(name) {
	        return name ? namedInstances[name] : singleton;
	    }

	};

	var ForceService = function () {
	    function ForceService() {
	        var oauth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	        _classCallCheck(this, ForceService);

	        this.appId = oauth.appId; // Used in refreshAccessToken()
	        this.accessToken = oauth.accessToken;
	        this.instanceURL = oauth.instanceURL;
	        this.refreshToken = oauth.refreshToken;
	        this.userId = oauth.userId;

	        this.apiVersion = options.apiVersion || "v41.0";
	        this.loginURL = options.loginURL || "https://login.salesforce.com";

	        // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
	        // or using the Salesforce console. Can be overriden in init()
	        if (options.useProxy == undefined) {
	            this.useProxy = window.cordova || window.SfdcApp || window.sforce || window.LCC ? false : true;
	        } else {
	            this.useProxy = options.useProxy;
	        }
	        console.log('useProxy: ' + options.useProxy + ' ' + this.useProxy);

	        // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
	        // To override default, pass proxyURL in init(props)
	        this.proxyURL = options.proxyURL || baseURL;
	    }

	    /**
	     * Determines the request base URL.
	     */


	    _createClass(ForceService, [{
	        key: "getRequestBaseURL",
	        value: function getRequestBaseURL() {

	            var url = void 0;

	            if (this.useProxy) {
	                url = this.proxyURL;
	            } else if (this.instanceURL) {
	                url = this.instanceURL;
	            } else {
	                url = serverURL;
	            }

	            // dev friendly API: Remove trailing "/" if any so url + path concat always works
	            if (url.slice(-1) === "/") {
	                url = url.slice(0, -1);
	            }

	            console.log('useProxy:' + this.useProxy + ' instanceURL: ' + this.instanceURL + 'requestBaseURL: ' + url);
	            return url;
	        }
	    }, {
	        key: "refreshAccessToken",
	        value: function refreshAccessToken() {}
	    }, {
	        key: "getUserId",
	        value: function getUserId() {
	            return this.userId;
	        }

	        /**
	         * Lets you make any Salesforce REST API request.
	         * @param obj - Request configuration object. Can include:
	         *  method:  HTTP method: GET, POST, etc. Optional - Default is "GET"
	         *  path:    path in to the Salesforce endpoint - Required
	         *  params:  queryString parameters as a map - Optional
	         *  data:  JSON object to send in the request body - Optional
	         */

	    }, {
	        key: "request",
	        value: function request(obj) {
	            var _this = this;

	            return new Promise(function (resolve, reject) {
	                if (!_this.accessToken && !_this.refreshToken) {
	                    if (typeof errorHandler === "function") {
	                        reject("No access token. Login and try again.");
	                    }
	                    return;
	                }

	                var method = obj.method || "GET",
	                    xhr = new XMLHttpRequest(),
	                    url = _this.getRequestBaseURL();

	                // dev friendly API: Add leading "/" if missing so url + path concat always works
	                if (obj.path.charAt(0) !== "/") {
	                    obj.path = "/" + obj.path;
	                }

	                url = url + obj.path;

	                if (obj.params) {
	                    url += "?" + toQueryString(obj.params);
	                }

	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (xhr.status > 199 && xhr.status < 300) {
	                            if (xhr.responseType == 'arraybuffer') {
	                                resolve(xhr.response);
	                            } else {
	                                try {
	                                    var json = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
	                                } catch (err) {
	                                    var json = xhr.responseText;
	                                }
	                                resolve(json);
	                            }
	                        } else if (xhr.status === 401 && _this.refreshToken) {
	                            _this.refreshAccessToken()
	                            // Try again with the new token
	                            .then(function () {
	                                return _this.request(obj).then(function (data) {
	                                    return resolve(data);
	                                }).catch(function (error) {
	                                    return reject(error);
	                                });
	                            }).catch(function () {
	                                reject(xhr);
	                            });
	                        } else {
	                            reject(xhr);
	                        }
	                    }
	                };

	                xhr.open(method, url, true);
	                xhr.setRequestHeader("Accept", "application/json");
	                xhr.setRequestHeader("Authorization", "Bearer " + _this.accessToken);
	                xhr.setRequestHeader("Cache-Control", "no-store");
	                // See http://www.salesforce.com/us/developer/docs/chatterapi/Content/intro_requesting_bearer_token_url.htm#kanchor36
	                xhr.setRequestHeader("X-Connect-Bearer-Urls", true);

	                if (obj.responseType) {
	                    xhr.responseType = obj.responseType;
	                }

	                if (obj.contentType) {
	                    xhr.setRequestHeader("Content-Type", obj.contentType);
	                }
	                if (obj.headerParams) {
	                    for (var headerName in obj.headerParams.getOwnPropertyNames()) {
	                        var headerValue = obj.headerParams[headerName];
	                        xhr.setRequestHeader(headerName, headerValue);
	                    }
	                }
	                if (_this.useProxy) {
	                    xhr.setRequestHeader("Target-URL", _this.instanceURL);
	                }
	                xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);
	            });
	        }

	        /**
	         * Convenience function to execute a SOQL query
	         * @param soql
	         * @param batch
	         */

	    }, {
	        key: "query",
	        value: function query(soql) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/query",
	                params: { q: soql }
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to execute a SOQL queryAll
	         * @param soql
	         * @param batch
	         */

	    }, {
	        key: "queryAll",
	        value: function queryAll(soql) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/queryAll",
	                params: { q: soql }
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to retrieve a single record based on its Id
	         * @param objectName
	         * @param id
	         * @param fields
	         * @param batch
	         */

	    }, {
	        key: "retrieve",
	        value: function retrieve(objectName, id, fields) {
	            var batch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id,
	                params: fields ? { fields: typeof fields === "string" ? fields : fields.join(",") } : undefined
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to retrieve picklist values from a SalesForce Field
	         * @param objectName
	         * @param batch
	         */

	    }, {
	        key: "getPickListValues",
	        value: function getPickListValues(objectName, batch) {
	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/describe"
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to create a new record
	         * @param objectName
	         * @param data
	         * @param batch
	         */

	    }, {
	        key: "create",
	        value: function create(objectName, data) {
	            var batch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	            var r = {
	                method: "POST",
	                contentType: "application/json",
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/",
	                data: data
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
	         * @param objectName
	         * @param data The object to update. Must include the Id field.
	         * @param method In some cases a PATCH is needed instead of a POST
	         * @param batch
	         */

	    }, {
	        key: "update",
	        value: function update(objectName, data) {
	            var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'POST';
	            var batch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


	            var id = data.Id || data.id,
	                fields = JSON.parse(JSON.stringify(data));

	            delete fields.attributes;
	            delete fields.Id;
	            delete fields.id;

	            var r = {
	                method: method,
	                contentType: "application/json",
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id,
	                params: { "_HttpMethod": "PATCH" },
	                data: fields
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }
	    }, {
	        key: "del",


	        /**
	         * Convenience function to delete a record
	         * @param objectName
	         * @param id
	         * @param batch
	         */
	        value: function del(objectName, id) {
	            var batch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	            var r = {
	                method: "DELETE",
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to upsert a record
	         * @param objectName
	         * @param externalIdField
	         * @param externalId
	         * @param data
	         * @param batch
	         */

	    }, {
	        key: "upsert",
	        value: function upsert(objectName, externalIdField, externalId, data) {
	            var batch = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

	            var r = {
	                method: "PATCH",
	                contentType: "application/json",
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + externalIdField + "/" + externalId,
	                data: data
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Convenience function to invoke APEX REST endpoints
	         * @param pathOrParams
	         */

	    }, {
	        key: "apexrest",
	        value: function apexrest(pathOrParams) {

	            var obj = void 0;

	            if (typeof pathOrParams === "string") {
	                obj = { path: pathOrParams, method: "GET" };
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
	                obj.contentType = obj.method == "DELETE" || obj.method == "GET" ? null : "application/json";
	            }

	            return this.request(obj);
	        }

	        /**
	         * Convenience function to invoke the Chatter API
	         * @param pathOrParams
	         * @param batch
	         */

	    }, {
	        key: "chatter",
	        value: function chatter(pathOrParams) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


	            var basePath = "/services/data/" + this.apiVersion + "/chatter";
	            var params = void 0;

	            if (pathOrParams && pathOrParams.substring) {
	                params = { path: joinPaths(basePath, pathOrParams) };
	            } else if (pathOrParams && pathOrParams.path) {
	                params = pathOrParams;
	                params.path = joinPaths(basePath, pathOrParams.path);
	            } else {
	                return new Promise(function (resolve, reject) {
	                    return reject("You must specify a path for the request");
	                });
	            }

	            var r = params;

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Lists summary information about each Salesforce.com version currently
	         * available, including the version, label, and a link to each version's
	         * root.
	         */

	    }, {
	        key: "versions",
	        value: function versions() {
	            return this.request({
	                path: "/services/data/"
	            });
	        }

	        /**
	         * Lists available resources for the client's API version, including
	         * resource name and URI.
	         * @param batch
	         */

	    }, {
	        key: "resources",
	        value: function resources() {
	            var batch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Lists the available objects and their metadata for your organization's
	         * data.
	         * @param batch
	         */

	    }, {
	        key: "describeGlobal",
	        value: function describeGlobal() {
	            var batch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects"
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Describes the individual metadata for the specified object.
	         * @param objectName object name; e.g. "Account"
	         * @param batch
	         */

	    }, {
	        key: "metadata",
	        value: function metadata(objectName) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Completely describes the individual metadata at all levels for the
	         * specified object.
	         * @param objectName object name; e.g. "Account"
	         * @param batch
	         */

	    }, {
	        key: "describe",
	        value: function describe(objectName) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/describe"
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Fetches the layout configuration for a particular sobject name and record type id.
	         * @param batch
	         */

	    }, {
	        key: "describeLayout",
	        value: function describeLayout(objectName, recordTypeId) {
	            var batch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	            recordTypeId = recordTypeId || "";
	            var r = {
	                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/describe/layouts/" + recordTypeId
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * list all created reports
	         * @param id return a specific report
	         * @param batch
	         * @returns {*}
	         */

	    }, {
	        key: "reports",
	        value: function reports() {
	            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            if (id !== '') {
	                id = '/' + id;
	            }
	            var r = {
	                path: "/services/data/" + this.apiVersion + "/analytics/reports" + id
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Lists all created dashboard
	         * @param id return a specific dashboard
	         * @param batch
	         * @returns {*}
	         */

	    }, {
	        key: "dashboard",
	        value: function dashboard() {
	            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            if (id !== '') {
	                id = '/' + id;
	            }
	            var r = {
	                path: "/services/data/" + this.apiVersion + "/analytics/dashboards" + id
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Queries the next set of records based on pagination.
	         * This should be used if performing a query that retrieves more than can be returned
	         * in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm
	         *
	         * @param url - the url retrieved from nextRecordsUrl or prevRecordsUrl
	         * @param batch
	         */

	    }, {
	        key: "queryMore",
	        value: function queryMore(url) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


	            var obj = parseUrl(url);
	            var r = {
	                path: obj.path,
	                params: obj.params
	            };

	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * Executes the specified SOSL search.
	         * @param sosl a string containing the search to execute - e.g. "FIND
	         *             {needle}"
	         * @param batch
	         */

	    }, {
	        key: "search",
	        value: function search(sosl) {
	            var batch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	            var r = {
	                path: "/services/data/" + this.apiVersion + "/search",
	                params: { q: sosl }
	            };
	            if (batch) return this.batchTransaction(r);
	            return this.request(r);
	        }

	        /**
	         * return request object
	         * @param r
	         * @return {Promise}
	         */

	    }, {
	        key: "batchTransaction",
	        value: function batchTransaction(r) {
	            if (!r['method']) {
	                r['method'] = 'GET';
	            }

	            // dev friendly API: Add leading "/" if missing so url + path concat always works
	            if (r.path.charAt(0) !== "/") {
	                r.path = "/" + r.path;
	            }
	            if (r.params) {
	                r.url = r.path + "?" + toQueryString(r.params, false);
	            } else {
	                r.url = r.path;
	            }

	            // a composite call need “body” instead of “data”
	            if (r.hasOwnProperty('data')) {
	                r.body = r.data;
	                delete r.data;
	            }
	            delete r.params;
	            delete r.path;

	            return new Promise(function (resolve, reject) {
	                return resolve(r);
	            });
	        }

	        /**
	         * execute batch rest calls
	         * @param requests
	         * @return {*}
	         */

	    }, {
	        key: "batch",
	        value: function batch(requests) {

	            // remove not used attributes
	            for (var i = 0; i < requests.length; i++) {
	                delete requests[i]['contentType'];
	                if (requests[i].hasOwnProperty('body')) {
	                    requests[i]['richInput'] = requests[i]['body'];
	                    delete requests[i]['body'];
	                }
	            }

	            return this.request({
	                method: "POST",
	                contentType: "application/json",
	                path: "/services/data/" + this.apiVersion + "/composite/batch",
	                data: {
	                    "batchRequests": requests
	                }
	            });
	        }

	        /**
	         * execute composite call
	         * @param requests
	         * @param treeObject execute composite tree call, treeObject have to be the object name
	         * @returns {*}
	         */

	    }, {
	        key: "composite",
	        value: function composite(requests) {
	            var treeObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';


	            // remove not used attributes
	            for (var i = 0; i < requests.length; i++) {
	                delete requests[i]['contentType'];
	            }

	            if (treeObject) {
	                return this.request({
	                    method: "POST",
	                    contentType: "application/json",
	                    path: "/services/data/" + this.apiVersion + "/composite/tree/" + treeObject + '/',
	                    data: {
	                        "records": requests
	                    }
	                });
	            } else {
	                return this.request({
	                    method: "POST",
	                    contentType: "application/json",
	                    path: "/services/data/" + this.apiVersion + "/composite",
	                    data: {
	                        "compositeRequest": requests
	                    }
	                });
	            }
	        }
	    }]);

	    return ForceService;
	}();

	var ForceServiceWeb = function (_ForceService) {
	    _inherits(ForceServiceWeb, _ForceService);

	    function ForceServiceWeb() {
	        _classCallCheck(this, ForceServiceWeb);

	        return _possibleConstructorReturn(this, (ForceServiceWeb.__proto__ || Object.getPrototypeOf(ForceServiceWeb)).apply(this, arguments));
	    }

	    _createClass(ForceServiceWeb, [{
	        key: "refreshAccessToken",
	        value: function refreshAccessToken() {
	            var _this3 = this;

	            return new Promise(function (resolve, reject) {

	                if (!_this3.refreshToken) {
	                    console.log("Missing refreshToken");
	                    reject("Missing refreshToken");
	                    return;
	                }

	                if (!_this3.appId) {
	                    console.log("Missing appId");
	                    reject("Missing appId");
	                    return;
	                }

	                var xhr = new XMLHttpRequest(),
	                    params = {
	                    "grant_type": "refresh_token",
	                    "refresh_token": _this3.refreshToken,
	                    "client_id": _this3.appId
	                },
	                    url = _this3.useProxy ? _this3.proxyURL : _this3.loginURL;

	                url = url + "/services/oauth2/token?" + toQueryString(params);

	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (xhr.status === 200) {
	                            console.log("Token refreshed");
	                            var res = JSON.parse(xhr.responseText);
	                            _this3.accessToken = res.access_token;
	                            resolve();
	                        } else {
	                            console.log("Error while trying to refresh token: " + xhr.responseText);
	                            reject();
	                        }
	                    }
	                };

	                xhr.open("POST", url, true);
	                if (!_this3.useProxy) {
	                    xhr.setRequestHeader("Target-URL", _this3.loginURL);
	                }
	                xhr.send();
	            });
	        }
	    }]);

	    return ForceServiceWeb;
	}(ForceService);

	var ForceServiceCordova = function (_ForceService2) {
	    _inherits(ForceServiceCordova, _ForceService2);

	    function ForceServiceCordova() {
	        _classCallCheck(this, ForceServiceCordova);

	        return _possibleConstructorReturn(this, (ForceServiceCordova.__proto__ || Object.getPrototypeOf(ForceServiceCordova)).apply(this, arguments));
	    }

	    _createClass(ForceServiceCordova, [{
	        key: "refreshAccessToken",
	        value: function refreshAccessToken() {
	            var _this5 = this;

	            return new Promise(function (resolve, reject) {
	                document.addEventListener("deviceready", function () {
	                    var oauthPlugin = void 0;
	                    try {
	                        oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
	                    } catch (e) {
	                        // fail silently
	                    }
	                    if (!oauthPlugin) {
	                        console.error("Salesforce Mobile SDK OAuth plugin not available");
	                        reject("Salesforce Mobile SDK OAuth plugin not available");
	                        return;
	                    }
	                    oauthPlugin.authenticate(function (response) {
	                        _this5.accessToken = response.accessToken;
	                        resolve();
	                    }, function () {
	                        console.error("Error refreshing oauth access token using the oauth plugin");
	                        reject();
	                    });
	                }, false);
	            });
	        }

	        /**
	         * @param path: full path or path relative to end point - required
	         * @param endPoint: undefined or endpoint - optional
	         * @return object with {endPoint:XX, path:relativePathToXX}
	         *
	         * For instance for undefined, "/services/data"     => {endPoint:"/services/data", path:"/"}
	         *                  undefined, "/services/apex/abc" => {endPoint:"/services/apex", path:"/abc"}
	         *                  "/services/data, "/versions"    => {endPoint:"/services/data", path:"/versions"}
	         */

	    }, {
	        key: "computeEndPointIfMissing",
	        value: function computeEndPointIfMissing(endPoint, path) {
	            if (endPoint !== undefined) {
	                return { endPoint: endPoint, path: path };
	            } else {
	                var parts = path.split("/").filter(function (s) {
	                    return s !== "";
	                });
	                if (parts.length >= 2) {
	                    return { endPoint: "/" + parts.slice(0, 2).join("/"), path: "/" + parts.slice(2).join("/") };
	                } else {
	                    return { endPoint: "", path: path };
	                }
	            }
	        }
	    }, {
	        key: "request",
	        value: function request(obj) {
	            var _this6 = this;

	            if (networkPlugin) {
	                // ignore the SF Cordova plugin and execute a xhr call
	                if (obj.hasOwnProperty('direct') && obj.direct) {
	                    obj.responseType = 'arraybuffer';
	                    return _get(ForceServiceCordova.prototype.__proto__ || Object.getPrototypeOf(ForceServiceCordova.prototype), "request", this).call(this, obj);
	                } else {
	                    return new Promise(function (resolve, reject) {

	                        var obj2 = _this6.computeEndPointIfMissing(obj.endPoint, obj.path);
	                        if (obj.params === undefined) {
	                            obj.params = {};
	                        }
	                        if ('q' in obj.params) {
	                            obj.params.q = obj.params.q.replace(/[\n]/g, " ");
	                        }
	                        networkPlugin.sendRequest(obj2.endPoint, obj2.path, resolve, reject, obj.method, obj.data || obj.params, obj.headerParams);
	                    });
	                }
	            } else {
	                return _get(ForceServiceCordova.prototype.__proto__ || Object.getPrototypeOf(ForceServiceCordova.prototype), "request", this).call(this, obj);
	            }
	        }
	    }]);

	    return ForceServiceCordova;
	}(ForceService);

/***/ }
/******/ ])
});
;