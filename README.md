# ForceJS -- ECMAScript 6 Version

### Salesforce REST SDK

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications.
ForceJS allows you to easily login to Salesforce using OAuth, and to manipulate your Salesforce data using a simple
API.

ForceJS is a lightweight library and has no dependency.

The main target for ForceJS are applications running on your own server (Heroku or elsewhere) and Cordova/Mobile SDK applications.  

## ES6 branch

This branch is where the ECMAScript 6 version of ForceJS is being developed. Key characteristics of this version:

- ForceJS is now loaded as an ES6 module
- Use of ES6 promises instead of callbacks.   

## Browser and Cordova without Code Changes

If you develop a hybrid application using the Mobile SDK, you often switch back and forth between running the app in the browser and on device: Developing in the browser is generally faster and easier to debug, but you still need to test device-specific features and check that everything runs as expected on the target platforms. The problem is that the configuration of OAuth and REST is different when running in the browser and on device. Here is a summary of the key differences:

<table>
<tr><td></td><td><strong>Browser</strong></td><td><strong>Mobile SDK</strong></td></tr>
<tr><td>Requires Proxy</td><td>Yes</td><td>No</td></tr>
<tr><td>OAuth</td><td>Window Popup</td><td>OAuth Plugin</td></tr>
</table>

ForceJS abstracts these differences and allows you to run your app in the browser and on device without code or configuration changes.

## Key Characteristics

- No dependency
- Loaded as an ECMAScript 6 module
- Complete OAuth login workflow
- Works transparently in the browser and in Cordova using the Salesforce Mobile SDK OAuth plugin
- Automatically refreshes OAuth access_token on expiration
- Tightly integrated with [ForceServer](https://github.com/ccoenraets/force-server), a local development server that works as a proxy and a local web server to provide a streamlined developer experience
- Simple API to manipulate data (create, update, delete, upsert)


## Quick Start

1. Install force-server

    Because of the browser's cross-origin restrictions, your JavaScript application hosted on your own server (or localhost) will not be able to make API calls directly to the *.salesforce.com domain. The solution is to proxy your API calls through your own server. You can use your own proxy server, but ForceJS is tightly integrated with [ForceServer](https://github.com/ccoenraets/force-server), a simple development server for Force.com. To install ForceServer, make sure Node.js is installed on your system, open a command prompt and execute the following command:

    ```
    npm install -g force-server
    ```

    On a Mac, you may have to use sudo:

    ```
    sudo npm install -g force-server
    ```

1. Open a command prompt and clone this repository

    ```
    git clone https://github.com/ccoenraets/forcejs
    ```

1. Navigate to the **forcejs** directory

1. Switch ot the **es6** branch

    ```
    git checkout es6
    ```

1. Type the following command to install the modules required to build the sample project (babel, browserify, and babelify):

    ```
    npm install
    ```

1. Type the following command to build the client application:

    ```
    npm run build-app
    ```

1. Type the following command to start force-server:

    ```
    force-server
    ```

    This starts the ForceServer server on port 8200 and loads the sample app in your default browser

1. Click the **Login** button and authenticate against tour Salesforce org

1. Click the **Get Contacts** button to load the list of contacts

> Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS.


## API Reference

### init()

Used to initialize ForceJS with non-default parameters. ForceJS is built to work out of the box with sensible defaults. **You only need to invoke force.init() if you want to override these defaults**:

Parameters:

- **appId**

    The Salesforce Connected App Id. For convenience, ForceJS uses a default connected app if the appId is not provided. The default connected app supports http://localhost:8200/oauthcallback.html as the OAuth callback URL to provide an out-of-the-box development experience using force-server. You need to create your own connected app with your own OAuth callback URL to run your application on a different server and port.

    *Default*: **3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92**.

- **oauthCallbackURL**

    The URL Salesforce calls back with an authenticated access token (or an error) at the end of the OAuth authentication workflow.

    *Default*: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default OAuth callback URL is http://localhost:8200/oauthcallback.html. If you load the app from https://myserver.com/myapp, the default OAuth callback URL is https://myserver.com/myapp/oauthcallback.html


- **proxyURL**

    The URL of the CORS proxy server. This parameter is ignored when the app is running in Cordova or inside a Visualforce page.

    *Default*: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default proxyURL is http://localhost:8200. If you load the app from https://myserver.com/myapp, the default proxyURL is https://myserver.com/myapp

- **useProxy**

    *Default*: **false** if the app is running in Cordova or in a Visualforce page, **true** if it's not

    By default, ForceJS will automatically determine if it needs to use a CORS proxy: It won't use a proxy if the app is running inside a Visualforce page or a Cordova app, and will use the proxy in any other case. You can force ForceJS to always use a proxy by setting this value to true.

    Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS. If you whitelist your domain and use APIs that support CORS, you can set useProxy to false.

- **loginURL**

    The URL for the login window that should be used as part of the OAuth process.

    *Default*: https://login.salesforce.com


- **apiVersion**

    The version of the Salesforce API.

    *Default*: v33.0


Use the following init parameters, if you don't need to authenticate the user because you already have an authenticated token. For example, if you are running the app from a Visualforce page. **accessToken** is the only required parameter in that scenario.


- **accessToken**

    *Default*: n/a

    The authenticated access token

- **instanceURL**

    *Default*: n/a

    The Salesforce instance URL

- **refreshToken**

    *Default*: n/a

    The refresh token

Example:
```
force.init({
    appId: '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',
    apiVersion: 'v33.0',
    loginURL: 'https://login.salesforce.com',
    oauthRedirectURL: 'http://localhost:8200/oauthcallback.html',
    proxyURL: 'http://localhost:8200'
});
```


### query()

Used to execute a SOQL statement

Example:

```
force.query("SELECT id, name FROM contact",
    function(result) {
        console.log(result.records);
    ),
    function(error) {
        console.log(error);
    });
```

### create()

Used to create a record for a Salesforce object

Example:

```
force.create('contact', {FirstName: "Lisa", LastName: "Jones"},
    function(response) {
        console.log(response);
    },
    function(error) {
        console.log(error);
    });
```

### update()

Used to update a record

Example:

```
force.update('contact', {Id: "0031a000001x7DOAAY", FirstName: "Emma", LastName: "Wong"},
    function(response) {
        console.log(response);
    },
    function(error) {
        console.log(error);
    });
```

### del()

Used to delete a record

Example:

```
force.del('contact', "0031a000001x7DOAAY",
    function(response) {
        console.log(response);
    },
    function(error) {
        console.log(error);
    });
```

### upsert()

Used to upsert a record

Example:

```
force.query("SELECT id, name FROM contact",
    function(result) {
    ),
    function(error) {
    });
```

### retrieve()

Used to retrieve a single record

Example:

```
force.retrieve('contact', id, null,
    function(contact) {
        console.log(contact);
    },
    function(error) {
        console.log(error);
    });
```

### apexrest()

Used to invoke a custom REST service endpoint implemented by your own Apex class.

Example:

```
force.apexrest("contacts",
    function(result) {
        console.log(result)
    ),
    function(error) {
        console.log(error);
    });
```

### request()

The core method to invoke a REST services. Other functions (query, create, update, del, upsert, apexrest) are just convenience functions invoking request() behind the scenes. You can use request() directly to invoke other REST services that are not directly exposed through a convenience function.

Example:

```
force.request({path: "/services/data"},
    function(result) {
        console.log(result)
    ),
    function(error) {
        console.log(error);
    });
```

Parameters:

- **path**

    The path of the service to invoke

- **method**

    The HTTP method to execute: GET, POST, PUT, DELETE, PATCH

    *Default*: GET

- **contentType**     

    The request content type.


- **params**

    An object that will be turned into a query string appended to the request URL

- **data**

    An object representing data to be sent as the body of the request.


### isAuthenticated()

Used to figure out if the user is authenticated, in other words ForceJS has an authenticated access token.

Example:

```
alert(force.isLoggedIn());
```

### getUserId()

Used to get the authenticated user's id

Example:

```
alert("The current user is: " + force.getUserId());
```

### discardToken()

Used to discard the authentication token.

Example:

```
force.discardToken();
```

### chatter()

A convenience function to use the Chatter API

Example:

```
force.chatter({path: "/users/me"},
    function(result) {
        console.log(result)
    ),
    function(error) {
        console.log(error);
    });
```

Parameters:

- **path**

    The path of the Chatter API service to invoke

- **method**

    The HTTP method to execute: GET, POST, PUT, DELETE, PATCH

    *Default*: GET

- **contentType**     

    The request content type.


- **params**

    An object that will be turned into a query string appended to the request URL

- **data**

    An object representing data to be sent as the body of the request.
