# ForceJS - JavaScript Toolkit for Salesforce APIs

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications. ForceJS allows you to easily authenticate with Salesforce using OAuth, and to manipulate Salesforce data using a simple API.

The main target of ForceJS are:
- Client-side JavaScript applications deployed on your own server (Heroku or elsewhere)
- Hybrid mobile apps built with Apache Cordova and the Salesforce Mobile SDK.

Applications deployed inside a Salesforce instance (Visualforce Page or Lightning Components) can use one of the data access utilities built into the Salesforce Platform instead: JavaScript Remoting, Remote Objects, Lightning Data Service, etc.   

## Built on ECMAScript 6

Modern JavaScript applications now use ECMAScript 6 (aka ECMAScript 2015) and beyond. The current version of modern frameworks (such as React, Angular 2, and Ionic 2) are also built on top of ECMAScript 6 and beyond.
To support modern application development, and to integrate nicely with these frameworks, ForceJS is now built on top of ECMAScript 6 as well.  

> The original ECMAScript 5 version is available in the [es5 branch](https://github.com/ccoenraets/forcejs/tree/es5) of this repository

## Key Characteristics

- No dependency
- Loaded as an ECMAScript 6 module
- Asynchronous calls return ECMAScript 6 promises   
- Complete OAuth login workflow (User Agent)
- Works transparently in the browser and in Cordova using the Salesforce Mobile SDK OAuth plugin
- Automatically refreshes OAuth access_token (if available) on expiration
- Tightly integrated with [force-server](https://github.com/ccoenraets/force-server), a local development server that works as a proxy and a local web server to provide a streamlined developer experience
- Simple API to manipulate data (create, update, delete, upsert)
- Supports connections to multiple instances of Salesforce in the same application
- Works with modern JavaScript frameworks: React, Angular 2, Ionic 2, etc.

## Modular

ForceJS is built in a modular fashion. It currently includes two modules:

- **forcejs/oauth**: A module that makes it easy to authenticate with Salesforce using the OAuth User Agent workflow
- **forcejs/data**: A module that makes it easy to access data through the Salesforce APIs

forcejs/oauth and forcejs/service are typically used together in an application, but you can use them separately. For example, you could use **forcejs/oauth** by itself if all your application needs is a Salesforce access token (Lightning Out use cases). Similarly, you could use **forcejs/data** by itself if you already have an access token and all you need is a simple library to access the Salesforce APIs.

## Build Process

Because current browsers don't yet support all the ECMAScript 6 features, you need to use a build tool to compile (transpile) your ECMAScript 6 code to ECMAScript 5 compatible code, and provide the module loading infrastructure.
Webpack, Browserify, and Rollup are popular options. Webpack instructions are provided in the Quick Start sections below.

## Browser and Cordova Abstraction

ForceJS can be used to develop browser-based apps or hybrid mobile apps using the Salesforce Mobile SDK and Apache Cordova. If you develop a hybrid application using the Salesforce Mobile SDK, you often switch back and forth between running the app in the browser and on device. Developing in the browser is generally faster and easier to debug, but you still need to test device-specific features and check that everything runs as expected on the target platforms. The problem is that the configuration of OAuth and REST is different when running in the browser and on device. Here is a summary of the key differences:

<table>
<tr><td></td><td><strong>Browser</strong></td><td><strong>Mobile SDK</strong></td></tr>
<tr><td>Requires Proxy</td><td>Yes(*)</td><td>No</td></tr>
<tr><td>OAuth</td><td>Window Popup</td><td>OAuth Plugin</td></tr>
</table>

(*) Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS.

ForceJS abstracts these differences and allows you to run your app in the browser and on device without code or configuration changes.

## Quick Start 1: Simple Browser App

1. Create a new directory for your project, navigate (`cd`) to that directory, and type the following command to initialize a project that uses the **npm** package manager (accept all the default values):

    ```
    npm init
    ```

1. Type the following command to install **forcejs**:

    ```
    npm install forcejs --save-dev
    ```

1. Type the following command to install the **force-server** development server:

    ```
    npm install force-server --save-dev
    ```

1. Type the following command to install **Webpack** and **Babel**:

    ```
    npm install babel-core babel-loader babel-preset-es2015 webpack --save-dev
    ```

1. Using your favorite editor, open `package.json` and modify the `scripts` section as follows:

    ```
    "scripts": {
        "webpack": "webpack",
        "start": "force-server"
    },
    ```

1. Create a file named `webpack.config.js` in your project's root directory:

    ```
    var path = require('path');
    var webpack = require('webpack');

    module.exports = {
        entry: './app.js',
        output: {
            filename: 'app.bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                }
            ]
        },
        stats: {
            colors: true
        },
        devtool: 'source-map'
    };
    ```

1. Create a file named `index.html` in your project's root directory:

    ```
    <!DOCTYPE html>
    <html>
    <body>
        <h1>Forcejs Quick Start</h1>
        <ul id="contacts"></ul>
        <script src="app.bundle.js"></script>
    </body>
    </html>
    ```

1. Create a file named `app.js` in your project's root directory:

    ```
    import OAuth from 'forcejs/oauth';
    import Service from 'forcejs/data';

    let oauth = OAuth.createInstance();
    oauth.login()
        .then(oauthResult => {
            Service.createInstance(oauthResult);
            loadContacts();
        });

    let loadContacts = () => {
        let service = Service.getInstance();
        service.query('select id, Name from contact LIMIT 50')
            .then(response => {
                let contacts = response.records;
                let html = '';
                contacts.forEach(contact => html = html + `<li>${contact.Name}</li>`);
                document.getElementById("contacts").innerHTML = html;
        });
    }
    ```

1. On the command line, type the following command to build your project:     

    ```
    npm run webpack
    ```

1. Type the following command to start the app in a browser:

    ```
    npm start
    ```


## Quick Start 2: Hybrid Mobile App

1. Install Cordova and the Salesforce Mobile SDK for the platform of your choice. For example, for iOS:

    ```
    npm install -g cordova forceios
    ```

    On a Mac, you may have to use sudo:

    ```
    sudo npm install -g cordova forceios
    ```

1. Create a new mobile application:

    ```
    forceios create
    ```

1. Answer the prompts as follows (adjust the company id and organization name as needed):

    ```
    Enter your application type (native, hybrid_remote, or hybrid_local): hybrid_local
    Enter your application name: myforcejsapp
    Enter the output directory for your app (defaults to the current directory):
    Enter your company identifier (com.mycompany): com.mycompany.myforcejsapp
    Enter your organization name (Acme, Inc.): MyCompany, Inc.
    Enter your Connected App ID (defaults to the sample app’s ID):
    Enter your Connected App Callback URI (defaults to the sample app’s URI):
    ```

1. Navigate (cd) to the project directory:

    ```
    cd myforcejsapp
    ```

1. Type the following command to initialize a project that uses the `npm` package manager (accept all the default values):

    ```
    npm init
    ```

1. Type the following command to install forcejs:

    ```
    npm install forcejs --save-dev
    ```

1. Type the following command to install the force-server development server:

    ```
    npm install force-server --save-dev
    ```

1. Type the following command to install Webpack and Babel:

    ```
    npm install babel-core babel-loader babel-preset-es2015 webpack --save-dev
    ```

1. Using your favorite editor, open `package.json` and modify the scripts section as follows:

    ```
    "scripts": {
        "webpack": "webpack",
        "start": "force-server --root www"
    },
    ```

1. Create a file named `webpack.config.js` in your project's root directory:

    ```
    var path = require('path');
    var webpack = require('webpack');

    module.exports = {
        entry: './app/app.js',
        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'app.bundle.js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                }
            ]
        },
        stats: {
            colors: true
        },
        devtool: 'source-map'
    };
    ```

1. Create a directory called `app`

1. In the `app` directory, create a file named `app.js`:

    ```
    import OAuth from 'forcejs/oauth';
    import Service from 'forcejs/data';

    let oauth = OAuth.createInstance();
    oauth.login()
        .then(oauthResult => {
            Service.createInstance(oauthResult);
            loadContacts();
        });

    let loadContacts = () => {
        let service = Service.getInstance();
        service.query('select id, Name from contact LIMIT 50')
            .then(response => {
                let contacts = response.records;
                let html = '';
                contacts.forEach(contact => html = html + `<li>${contact.Name}</li>`);
                document.getElementById("contacts").innerHTML = html;
        });
    }
    ```

1. In the `www` directory, delete all the files and directories except `bootconfig.json` and `index.html`

1. Open `index.html`. Replace the content with:

    ```
    <!DOCTYPE html>
    <html>
    <body>
        <h1>Forcejs App</h1>
        <ul id="contacts"></ul>
        <script src="cordova.js"></script>
        <script src="app.bundle.js"></script>
    </body>
    </html>
    ```  

1. On the command line, type the following command to build your project:     

  ```
  npm run webpack
  ```

1. Type the following command to run the app in the browser:

    ```
    npm start
    ```

1. On a Mac, type the following command to build the app for iOS:

    ```
    cordova build ios
    ```

1. Open `platforms/ios/myforcejsapp.xcodeproj` in Xcode. In the project properties, select a team corresponding to a valid certificate, and run the app in an emulator or on device.    

## API Reference

### forcejs/oauth

Basic Usage:

    ```
    import OAuth from "forcejs/oauth";
    let oauth = OAuth.createInstance();
    oauth.login().then(result => {
        console.log(result);
    });
    ```

#### createInstance(appId, loginURL, oauthCallbackURL)

- **appId**

    The Salesforce Connected App Id. For convenience, ForceJS uses a default connected app if the appId is not provided. The default connected app supports http://localhost:8200/oauthcallback.html as the OAuth callback URL to provide an out-of-the-box development experience using force-server. You need to create your own connected app with your own OAuth callback URL to run your application on a different server and port.

    *Default*: 3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92

- **loginURL**

    The URL for the login window that should be used as part of the OAuth process.

    *Default*: https://login.salesforce.com

- **oauthCallbackURL**

    The URL Salesforce calls back with an authenticated access token (or an error) at the end of the OAuth authentication workflow.

    *Default*: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default OAuth callback URL is http://localhost:8200/oauthcallback.html. If you load the app from https://myserver.com/myapp, the default OAuth callback URL is https://myserver.com/myapp/oauthcallback.html

#### login()

  Starts the User Agent OAuth workflow using a popup window when running in the browser or the oauth plugin when running in Cordova.

## forcejs/data

#### createInstance(oauth, options, name)

- **oauth**

    An object with the following fields:

    - **accessToken**

      *Required*: yes, *Default*: none

      The authenticated access token

    - **instanceURL**

      *Required*: yes, *Default*: none

      The Salesforce instance URL

    - **refreshToken**

      *Required*: no, *Default*: none

      The refresh token

- **options**. An object with the following fields.

    - **useProxy**

        *Default*: **false** if the app is running in Cordova or in a Visualforce page, **true** if it's not

        By default, ForceJS will automatically determine if it needs to use a CORS proxy: It won't use a proxy if the app is running inside a Visualforce page or a Cordova app, and will use the proxy in any other case. You can force ForceJS to always use a proxy by setting this value to true.

        Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS. If you whitelist your domain and use APIs that support CORS, you can set useProxy to false.

    - **proxyURL**

        The URL of the CORS proxy server. This parameter is ignored when the app is running in Cordova or inside a Visualforce page.

        *Default*: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default proxyURL is http://localhost:8200. If you load the app from https://myserver.com/myapp, the default proxyURL is https://myserver.com/myapp

    - **apiVersion**

        The version of the Salesforce API.

        *Default*: v36.0

- **name**. Optional. By default createInstance() creates a singleton instance which is what you want when your app works with a single Salesforce org. If you are building an app that connects to multiple Salesforce instances, provide a name that identifies the instance. For example:

    ```
    createInstance(oauth, options, "sales");
    ```

    You can later retrieve that specific instance using:

    ```
    getInstance("sales");
    ```

#### getInstance(name)

- **name**. Optional. If omitted, returns the singleton instance. If specified, return the named instance.


#### query(soql)

Used to execute a SOQL statement

Parameters:

  - **soql**: The SOQL statement

Example:

```
service.query("SELECT id, name FROM contact")
    .then(result => {
        console.log(result.records);
    })
    .catch(error => {
        console.log(error);
    });
```

#### create(objectName, valueObject)

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

#### update(objectName, valueObject)

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

#### del(objectName, recordId)

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

#### upsert()

Used to upsert a record

Example:

```
force.query("SELECT id, name FROM contact",
    function(result) {
    ),
    function(error) {
    });
```

#### retrieve(objectName, recordId)

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

#### apexrest(endpoint)

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

#### request()

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


#### isAuthenticated()

Used to figure out if the user is authenticated, in other words ForceJS has an authenticated access token.

Example:

```
alert(force.isLoggedIn());
```

#### getUserId()

Used to get the authenticated user's id

Example:

```
alert("The current user is: " + force.getUserId());
```

#### discardToken()

Used to discard the authentication token.

Example:

```
force.discardToken();
```

#### chatter()

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
