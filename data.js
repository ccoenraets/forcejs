/**
 * forcejs - REST toolkit for Salesforce.com
 * forcejs/data - Salesforce APIs data module
 * Author: Christophe Coenraets @ccoenraets
 * Version: 0.8.0
 */
"use strict";

// if page URL is http://localhost:3000/myapp/index.html, context is /myapp
let context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

// if page URL is http://localhost:3000/myapp/index.html, serverURL is http://localhost:3000
let serverURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");

// if page URL is http://localhost:3000/myapp/index.html, baseURL is http://localhost:3000/myapp
let baseURL = serverURL + context;

let joinPaths = (path1, path2) => {
    if (path1.charAt(path1.length - 1) !== "/") path1 = path1 + "/";
    if (path2.charAt(0) === "/") path2 = path2.substr(1);
    return path1 + path2;
};

let toQueryString = obj => {
    let parts = [],
        i;
    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
};

// Keeps track of single instance when instance is created with singleton form of createInstance:
// createInstance(oauth, options) with no third parameter (name of the instance)
let singleton;

// Keeps track of named instances when app needs data from multiple Salesforce orgs. For example:
// let org1 = ForceService.createInstance(oauth, options, "org1");
// let org2 = ForceService.createInstance(oauth, options, "org2");
let namedInstances = {};

export default {

    createInstance: (oauth, options, name) => {
        let instance;
        if (window.cordova) {
            instance = new ForceServiceCordova(oauth, options);
        } else {
            instance =  new ForceServiceWeb(oauth, options);
        }
        if (name) {
            namedInstances[name] = instance;
        } else {
            singleton = instance;
        }
        return instance;
    },

    getInstance: name => {
        return name ? namedInstances[name] : singleton;
    }

}

class ForceService {

    constructor(oauth = {}, options = {}) {

        this.accessToken = oauth.accessToken;
        this.instanceURL = oauth.instanceURL;
        this.refreshToken = oauth.refreshToken;

        this.apiVersion = options.apiVersion || "v36.0";
        this.loginURL = options.loginURL || "https://login.salesforce.com";

        // Whether or not to use a CORS proxy. Defaults to false if app running in Cordova, in a VF page,
        // or using the Salesforce console. Can be overriden in init()
        this.useProxy = options.useProxy || (window.cordova || window.SfdcApp || window.sforce) ? false : true;

        // Only required when using REST APIs in an app hosted on your own server to avoid cross domain policy issues
        // To override default, pass proxyURL in init(props)
        this.proxyURL = options.proxyURL || baseURL;
    }

    /*
     * Determines the request base URL.
     */
    getRequestBaseURL() {

        let url;

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

        return url;
    }

    refreshAccessToken() {
    };

    /**
     * Lets you make any Salesforce REST API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is "GET"
     *  path:    path in to the Salesforce endpoint - Required
     *  params:  queryString parameters as a map - Optional
     *  data:  JSON object to send in the request body - Optional
     */
    request(obj) {
        return new Promise((resolve, reject) => {

            if (!this.accessToken) {
                reject("No access token. Please login and try again.");
                return;
            }

            let method = obj.method || "GET",
                xhr = new XMLHttpRequest(),
                url = this.getRequestBaseURL();

            // dev friendly API: Add leading "/" if missing so url + path concat always works
            if (obj.path.charAt(0) !== "/") {
                obj.path = "/" + obj.path;
            }

            url = url + obj.path;

            if (obj.params) {
                url += "?" + toQueryString(obj.params);
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status > 199 && xhr.status < 300) {
                        resolve(xhr.responseText ? JSON.parse(xhr.responseText) : undefined);
                    } else if (xhr.status === 401) {
                        if (this.refreshToken) {
                            this.refreshAccessToken()
                            // Try again with the new token
                                .then(() => this.request(obj).then(data => resolve(data)).catch(error => reject(error)))
                                .catch(() => {
                                    console.error(xhr.responseText);
                                    let error = xhr.responseText ? JSON.parse(xhr.responseText) : {message: "Server error while refreshing token"};
                                    reject(error);
                                });
                        } else {
                            reject("Invalid or expired token");
                        }
                    } else {
                        let error = xhr.responseText ? JSON.parse(xhr.responseText) : {message: "Server error while executing request"};
                        reject(error);
                    }
                }
            };

            xhr.open(method, url, true);
            xhr.setRequestHeader("Accept", "application/json");
            xhr.setRequestHeader("Authorization", "Bearer " + this.accessToken);
            if (obj.contentType) {
                xhr.setRequestHeader("Content-Type", obj.contentType);
            }
            if (this.useProxy) {
                xhr.setRequestHeader("Target-URL", this.instanceURL);
            }
            xhr.send(obj.data ? JSON.stringify(obj.data) : undefined);

        });
    }

    /**
     * Convenience function to execute a SOQL query
     * @param soql
     */
    query(soql) {
        return this.request({
            path: "/services/data/" + this.apiVersion + "/query",
            params: {q: soql}
        })
    }

    /**
     * Convenience function to retrieve a single record based on its Id
     * @param objectName
     * @param id
     * @param fields
     */
    retrieve(objectName, id, fields) {
        return this.request({
                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id,
                params: fields ? {fields: fields} : undefined
            }
        );
    }

    /**
     * Convenience function to retrieve picklist values from a SalesForce Field
     * @param objectName
     */
    getPickListValues(objectName) {
        return this.request({
                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/describe"
            }
        );
    }

    /**
     * Convenience function to create a new record
     * @param objectName
     * @param data
     */
    create(objectName, data) {
        return this.request({
            method: "POST",
            contentType: "application/json",
            path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/",
            data: data
        });
    }

    /**
     * Convenience function to update a record. You can either pass the sobject returned by retrieve or query or a simple JavaScript object.
     * @param objectName
     * @param data The object to update. Must include the Id field.
     */
    update(objectName, data) {

        let id = data.Id || data.id,
            fields = JSON.parse(JSON.stringify(data));

        delete fields.attributes;
        delete fields.Id;
        delete fields.id;

        return this.request({
                method: "POST",
                contentType: "application/json",
                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id,
                params: {"_HttpMethod": "PATCH"},
                data: fields
            }
        );
    };

    /**
     * Convenience function to delete a record
     * @param objectName
     * @param id
     */
    del(objectName, id) {
        return this.request({
                method: "DELETE",
                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + id
            }
        );
    }

    /**
     * Convenience function to upsert a record
     * @param objectName
     * @param externalIdField
     * @param externalId
     * @param data
     */
    upsert(objectName, externalIdField, externalId, data) {
        return this.request({
                method: "PATCH",
                contentType: "application/json",
                path: "/services/data/" + this.apiVersion + "/sobjects/" + objectName + "/" + externalIdField + "/" + externalId,
                data: data
            }
        );
    }

    /**
     * Convenience function to invoke APEX REST endpoints
     * @param pathOrParams
     */
    apexrest(pathOrParams) {

        let params;

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

        return this.request(params);
    };

    /**
     * Convenience function to invoke the Chatter API
     * @param pathOrParams
     */
    chatter(pathOrParams) {

        let basePath = "/services/data/" + this.apiVersion + "/chatter";
        let params;

        if (pathOrParams && pathOrParams.substring) {
            params = {path: joinPaths(basePath, pathOrParams)};
        } else if (pathOrParams && pathOrParams.path) {
            params = pathOrParams;
            params.path = joinPaths(basePath, pathOrParams.path);
        } else {
            return new Promise((resolve, reject) => reject("You must specify a path for the request"));
        }

        return this.request(params);

    }

}

class ForceServiceWeb extends ForceService {

    refreshAccessToken() {
        return new Promise((resolve, reject) => {

            if (!this.refreshToken) {
                console.log("ERROR: refresh token does not exist");
                reject();
                return;
            }

            let xhr = new XMLHttpRequest(),

                params = {
                    "grant_type": "refresh_token",
                    "refresh_token": oauth.refresh_token,
                    "client_id": appId
                },

                url = this.useProxy ? this.proxyURL : this.loginURL;

            url = url + "/services/oauth2/token?" + toQueryString(params);

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log("Token refreshed");
                        let res = JSON.parse(xhr.responseText);
                        this.accessToken = res.access_token;
                        resolve();
                    } else {
                        console.log("Error while trying to refresh token: " + xhr.responseText);
                        reject();
                    }
                }
            };

            xhr.open("POST", url, true);
            if (!this.useProxy) {
                xhr.setRequestHeader("Target-URL", this.loginURL);
            }
            xhr.send();

        });
    }

}

class ForceServiceCordova extends ForceService {

    refreshAccessToken() {
        return new Promise((resolve, reject) => {
            document.addEventListener("deviceready", () => {
                let oauthPlugin = cordova.require("com.salesforce.plugin.oauth");
                if (!oauthPlugin) {
                    console.error("Salesforce Mobile SDK OAuth plugin not available");
                    reject("Salesforce Mobile SDK OAuth plugin not available");
                    return;
                }
                oauthPlugin.authenticate(
                    function (response) {
                        this.accessToken = response.accessToken;
                        resolve();
                    },
                    function () {
                        console.error("Error refreshing oauth access token using the oauth plugin");
                        reject();
                    }
                );
            }, false);
        });
    }

}