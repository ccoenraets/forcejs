/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _oauthUserAgent = __webpack_require__(1);
	
	var _oauthUserAgent2 = _interopRequireDefault(_oauthUserAgent);
	
	var _forceService = __webpack_require__(2);
	
	var _forceService2 = _interopRequireDefault(_forceService);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//Import the force module
	var list = document.getElementById('contactList'),
	    idField = document.getElementById('contactId'),
	    firstNameField = document.getElementById('firstName'),
	    lastNameField = document.getElementById('lastName'),
	    loginBtn = document.getElementById('loginBtn'),
	    discardTokenBtn = document.getElementById('discardTokenBtn'),
	    isLoggedInBtn = document.getElementById('isLoggedInBtn'),
	    queryBtn = document.getElementById('queryBtn'),
	    newBtn = document.getElementById('newBtn'),
	    createBtn = document.getElementById('createBtn'),
	    updateBtn = document.getElementById('updateBtn'),
	    deleteBtn = document.getElementById('deleteBtn'),
	    oauth = _oauthUserAgent2.default.createInstance();
	
	console.log("oauth");
	console.log(oauth);
	
	// ForceJS is built to work out of the box with sensible defaults.
	// Uncomment the service.init() function call below to provide specific runtime parameters
	//    service.init({
	//        appId: '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',
	//        apiVersion: 'v32.0',
	//        loginUrl: 'https://login.salesservice.com',
	//        oauthRedirectURL: 'http://localhost:8200/oauthcallback.html',
	//        proxyURL: 'http://localhost:8200'
	//    });
	
	var service = void 0;
	
	var errorHandler = function errorHandler(error) {
	    alert('An error has occurred');
	    console.log(error);
	};
	
	var login = function login(event) {
	    event.preventDefault();
	    oauth.login().then(function (result) {
	        console.log(result);
	        service = _forceService2.default.createInstance(result);
	        alert('Salesforce login succeeded');
	    }).catch(function (error) {
	        console.log(error);
	        alert('Salesforce login failed');
	    });
	};
	
	var query = function query() {
	
	    // Empty list
	    list.innerHTML = '';
	
	    // Retrieve contacts
	    service.query('select id, firstName, lastName from contact LIMIT 50').then(function (response) {
	        var str = '';
	        var contacts = response.records;
	        for (var i = 0; i < contacts.length; i++) {
	            str += '<a href="#' + contacts[i].Id + '" class="list-group-item">' + contacts[i].FirstName + ' ' + contacts[i].LastName + '</a>';
	        }
	        list.innerHTML = str;
	    }).catch(errorHandler);
	};
	
	function create() {
	    service.create('contact', { FirstName: firstNameField.value, LastName: lastNameField.value }).then(function (response) {
	        console.log(response);
	    }).catch(errorHandler);
	}
	
	function update() {
	    service.update('contact', { Id: idField.value, FirstName: firstNameField.value, LastName: lastNameField.value }).then(function (response) {
	        console.log(response);
	    }).catch(errorHandler);
	}
	
	function del() {
	    service.del('contact', idField.value).then(function (response) {
	        console.log(response);
	    }).catch(errorHandler);
	}
	
	function retrieve(id) {
	    service.retrieve('contact', id, null).then(function (contact) {
	        console.log(contact);
	        idField.value = contact.Id;
	        firstNameField.value = contact.FirstName;
	        lastNameField.value = contact.LastName;
	        createBtn.style.display = 'none';
	        updateBtn.style.display = 'inline';
	        deleteBtn.style.display = 'inline';
	    }).catch(errorHandler);
	}
	
	function discardToken(event) {
	    event.preventDefault();
	    service.discardToken();
	    alert('Token discarded');
	}
	
	function isLoggedIn(event) {
	    event.preventDefault();
	    alert(service.isLoggedIn());
	}
	
	function newContact() {
	    idField.value = "";
	    firstNameField.value = "";
	    lastNameField.value = "";
	    createBtn.style.display = 'inline';
	    updateBtn.style.display = 'none';
	    deleteBtn.style.display = 'none';
	}
	
	window.onhashchange = function () {
	    var id = window.location.hash.substr(1);
	    retrieve(id);
	};
	
	loginBtn.addEventListener("click", login);
	discardTokenBtn.addEventListener("click", discardToken);
	isLoggedInBtn.addEventListener("click", isLoggedIn);
	queryBtn.addEventListener("click", query);
	newBtn.addEventListener("click", newContact);
	updateBtn.addEventListener("click", update);
	createBtn.addEventListener("click", create);
	deleteBtn.addEventListener("click", del);

/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * ForceJS - REST toolkit for Salesforce.com
	 * Author: Christophe Coenraets @ccoenraets
	 * Version: 0.8.0
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var instanceCounter = 0;
	
	var // if page URL is http://localhost:3000/myapp/index.html, context is /myapp
	context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")),
	
	
	// if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
	serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : ''),
	
	
	// if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
	baseURL = serverURL + context,
	
	
	// Reference to the Salesforce OAuth plugin
	oauthPlugin = void 0;
	
	var getQueryStringAsObject = function getQueryStringAsObject(url) {
	    var obj = {},
	        index = url.indexOf('#');
	    if (index > -1) {
	        var queryString = decodeURIComponent(url.substr(index + 1)),
	            params = queryString.split('&');
	        params.forEach(function (param) {
	            var splitter = param.split('=');
	            obj[splitter[0]] = splitter[1];
	        });
	    }
	    return obj;
	};
	
	exports.default = {
	    createInstance: function createInstance(oauth, options) {
	        return window.cordova ? new OAuthCordova(oauth, options) : new OAuthWeb(oauth, options);
	    }
	};
	
	var OAuth = function () {
	    function OAuth(appId, loginURL, oauthCallbackURL) {
	        _classCallCheck(this, OAuth);
	
	        instanceCounter = instanceCounter + 1;
	        this.instanceId = instanceCounter;
	        this.appId = appId || "3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92";
	        this.loginURL = loginURL || "https://login.salesforce.com";
	        this.oauthCallbackURL = oauthCallbackURL || baseURL + '/oauthcallback.html';
	    }
	
	    _createClass(OAuth, [{
	        key: "login",
	        value: function login() {}
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
	                        console.error('Salesforce Mobile SDK OAuth plugin not available');
	                        reject('Salesforce Mobile SDK OAuth plugin not available');
	                        return;
	                    }
	                    oauthPlugin.getAuthCredentials(function (creds) {
	                        resolve({
	                            accessToken: creds.accessToken,
	                            instanceURL: creds.instanceUrl,
	                            refreshToken: creds.refreshToken
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
	
	                console.log('loginURL: ' + _this3.loginURL);
	                console.log('oauthCallbackURL: ' + _this3.oauthCallbackURL);
	
	                document.addEventListener("oauthCallback", function (event) {
	
	                    var url = event.detail,
	                        oauthResult = getQueryStringAsObject(url);
	
	                    if (oauthResult.state == _this3.instanceId) {
	
	                        if (oauthResult.access_token) {
	                            resolve({
	                                accessToken: oauthResult.access_token,
	                                instanceURL: oauthResult.instance_url,
	                                refreshToken: oauthResult.refresh_token
	                            });
	                        } else {
	                            reject(oauthResult);
	                        }
	                    }
	                });
	
	                var loginWindowURL = _this3.loginURL + ("/services/oauth2/authorize?client_id=" + _this3.appId + "&redirect_uri=" + _this3.oauthCallbackURL + "&response_type=token&state=" + _this3.instanceId);
	                window.open(loginWindowURL, '_blank', 'location=no');
	            });
	        }
	    }]);
	
	    return OAuthWeb;
	}(OAuth);

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * ForceJS - REST toolkit for Salesforce.com
	 * Author: Christophe Coenraets @ccoenraets
	 * Version: 0.8.0
	 */
	"use strict";
	
	// if page URL is http://localhost:3000/myapp/index.html, context is /myapp
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));
	
	// if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
	var serverURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
	
	// if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
	var baseURL = serverURL + context;
	
	var joinPaths = function joinPaths(path1, path2) {
	    if (path1.charAt(path1.length - 1) !== '/') path1 = path1 + "/";
	    if (path2.charAt(0) === '/') path2 = path2.substr(1);
	    return path1 + path2;
	};
	
	var toQueryString = function toQueryString(obj) {
	    var parts = [],
	        i = void 0;
	    for (i in obj) {
	        if (obj.hasOwnProperty(i)) {
	            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
	        }
	    }
	    return parts.join("&");
	};
	
	// Keeps track of single instance when instance is created with singleton form of createInstance:
	// createInstance(oauth, options) with no third parameter (name of the instance)
	var singleton = void 0;
	
	// Keeps track of named instances when app needs data from multiple Salesforce orgs. For example:
	// let org1 = ForceService.createInstance(oauth, options, "org1");
	// let org2 = ForceService.createInstance(oauth, options, "org2");
	var namedInstances = {};
	
	exports.default = {
	
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
	
	        this.accessToken = oauth.accessToken;
	        this.instanceURL = oauth.instanceURL;
	        this.refreshToken = oauth.refreshToken;
	
	        this.apiVersion = options.apiVersion || 'v36.0';
	        this.loginURL = options.loginURL || "https://login.salesforce.com";
	
	        // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
	        // or using the Salesforce console. Can be overriden in init()
	        this.useProxy = options.useProxy || window.cordova || window.SfdcApp || window.sforce ? false : true;
	
	        // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
	        // To override default, pass proxyURL in init(props)
	        this.proxyURL = options.proxyURL || baseURL;
	    }
	
	    /*
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
	
	            // dev friendly API: Remove trailing '/' if any so url + path concat always works
	            if (url.slice(-1) === '/') {
	                url = url.slice(0, -1);
	            }
	
	            return url;
	        }
	    }, {
	        key: "refreshAccessToken",
	        value: function refreshAccessToken() {}
	    }, {
	        key: "request",
	
	
	        /**
	         * Lets you make any Salesforce REST API request.
	         * @param obj - Request configuration object. Can include:
	         *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
	         *  path:    path in to the Salesforce endpoint - Required
	         *  params:  queryString parameters as a map - Optional
	         *  data:  JSON object to send in the request body - Optional
	         */
	        value: function request(obj) {
	            var _this = this;
	
	            return new Promise(function (resolve, reject) {
	
	                if (!_this.accessToken) {
	                    reject('No access token. Please login and try again.');
	                    return;
	                }
	
	                var method = obj.method || 'GET',
	                    xhr = new XMLHttpRequest(),
	                    url = _this.getRequestBaseURL();
	
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
	                            resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
	                        } else if (xhr.status === 401) {
	                            if (_this.refreshToken) {
	                                refreshAccessToken()
	                                // Try again with the new token
	                                .then(function () {
	                                    return _this.request(obj).then(function (data) {
	                                        return resolve(data);
	                                    }).catch(function (error) {
	                                        return reject(error);
	                                    });
	                                }).catch(function () {
	                                    console.error(xhr.responseText);
	                                    var error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Server error while refreshing token' };
	                                    reject(error);
	                                });
	                            } else {
	                                reject("Invalid or expired token");
	                            }
	                        } else {
	                            var error = xhr.responseText ? JSON.parse(xhr.responseText) : { message: 'Server error while executing request' };
	                            reject(error);
	                        }
	                    }
	                };
	
	                xhr.open(method, url, true);
	                xhr.setRequestHeader("Accept", "application/json");
	                xhr.setRequestHeader("Authorization", "Bearer " + _this.accessToken);
	                if (obj.contentType) {
	                    xhr.setRequestHeader("Content-Type", obj.contentType);
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
	         */
	
	    }, {
	        key: "query",
	        value: function query(soql) {
	            return this.request({
	                path: '/services/data/' + this.apiVersion + '/query',
	                params: { q: soql }
	            });
	        }
	
	        /**
	         * Convenience function to retrieve a single record based on its Id
	         * @param objectName
	         * @param id
	         * @param fields
	         */
	
	    }, {
	        key: "retrieve",
	        value: function retrieve(objectName, id, fields) {
	            return this.request({
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id,
	                params: fields ? { fields: fields } : undefined
	            });
	        }
	
	        /**
	         * Convenience function to retrieve picklist values from a SalesForce Field
	         * @param objectName
	         */
	
	    }, {
	        key: "getPickListValues",
	        value: function getPickListValues(objectName) {
	            return this.request({
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/describe'
	            });
	        }
	
	        /**
	         * Convenience function to create a new record
	         * @param objectName
	         * @param data
	         */
	
	    }, {
	        key: "create",
	        value: function create(objectName, data) {
	            return this.request({
	                method: 'POST',
	                contentType: 'application/json',
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/',
	                data: data
	            });
	        }
	
	        /**
	         * Convenience function to update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
	         * @param objectName
	         * @param data The object to update. Must include the Id field.
	         */
	
	    }, {
	        key: "update",
	        value: function update(objectName, data) {
	
	            var id = data.Id || data.id,
	                fields = JSON.parse(JSON.stringify(data));
	
	            delete fields.attributes;
	            delete fields.Id;
	            delete fields.id;
	
	            return this.request({
	                method: 'POST',
	                contentType: 'application/json',
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id,
	                params: { '_HttpMethod': 'PATCH' },
	                data: fields
	            });
	        }
	    }, {
	        key: "del",
	
	
	        /**
	         * Convenience function to delete a record
	         * @param objectName
	         * @param id
	         */
	        value: function del(objectName, id) {
	            return this.request({
	                method: 'DELETE',
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + id
	            });
	        }
	
	        /**
	         * Convenience function to upsert a record
	         * @param objectName
	         * @param externalIdField
	         * @param externalId
	         * @param data
	         */
	
	    }, {
	        key: "upsert",
	        value: function upsert(objectName, externalIdField, externalId, data) {
	            return this.request({
	                method: 'PATCH',
	                contentType: 'application/json',
	                path: '/services/data/' + this.apiVersion + '/sobjects/' + objectName + '/' + externalIdField + '/' + externalId,
	                data: data
	            });
	        }
	
	        /**
	         * Convenience function to invoke APEX REST endpoints
	         * @param pathOrParams
	         */
	
	    }, {
	        key: "apexrest",
	        value: function apexrest(pathOrParams) {
	
	            var params = void 0;
	
	            if (pathOrParams.substring) {
	                params = { path: pathOrParams };
	            } else {
	                params = pathOrParams;
	
	                if (params.path.charAt(0) !== "/") {
	                    params.path = "/" + params.path;
	                }
	
	                if (params.path.substr(0, 18) !== "/services/apexrest") {
	                    params.path = "/services/apexrest" + params.path;
	                }
	            }
	
	            return this.request(params);
	        }
	    }, {
	        key: "chatter",
	
	
	        /**
	         * Convenience function to invoke the Chatter API
	         * @param pathOrParams
	         */
	        value: function chatter(pathOrParams) {
	
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
	
	            return this.request(params);
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
	                    console.log('ERROR: refresh token does not exist');
	                    reject();
	                    return;
	                }
	
	                var xhr = new XMLHttpRequest(),
	                    params = {
	                    'grant_type': 'refresh_token',
	                    'refresh_token': oauth.refresh_token,
	                    'client_id': appId
	                },
	                    url = _this3.useProxy ? _this3.proxyURL : _this3.loginURL;
	
	                url = url + '/services/oauth2/token?' + toQueryString(params);
	
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        if (xhr.status === 200) {
	                            console.log('Token refreshed');
	                            var res = JSON.parse(xhr.responseText);
	                            _this3.accessToken = res.access_token;
	                            resolve();
	                        } else {
	                            console.log('Error while trying to refresh token: ' + xhr.responseText);
	                            reject();
	                        }
	                    }
	                };
	
	                xhr.open('POST', url, true);
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
	            return new Promise(function (resolve, reject) {
	                document.addEventListener("deviceready", function () {
	                    var oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
	                    if (!oauthPlugin) {
	                        console.error('Salesforce Mobile SDK OAuth plugin not available');
	                        reject('Salesforce Mobile SDK OAuth plugin not available');
	                        return;
	                    }
	                    oauthPlugin.authenticate(function (response) {
	                        this.accessToken = response.accessToken;
	                        resolve();
	                    }, function () {
	                        console.error('Error refreshing oauth access token using the oauth plugin');
	                        reject();
	                    });
	                }, false);
	            });
	        }
	    }]);
	
	    return ForceServiceCordova;
	}(ForceService);

/***/ }
/******/ ]);
//# sourceMappingURL=app.bundle.js.map