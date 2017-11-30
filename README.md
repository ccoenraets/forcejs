# ForceJS - JavaScript Toolkit for Salesforce APIs

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications. ForceJS allows you to easily authenticate with Salesforce using OAuth, and to manipulate Salesforce data using a simple API.

The main target of ForceJS are:
- Client-side JavaScript applications deployed on your own server (Heroku or elsewhere)
- Hybrid mobile apps built with Apache Cordova and the Salesforce Mobile SDK

Applications deployed inside a Salesforce instance (Visualforce Page or Lightning Components) can use one of the data access utilities built into the Salesforce Platform instead: JavaScript Remoting, Remote Objects, Lightning Data Service, etc.   

## Built on ECMAScript 6

Modern JavaScript applications now use ECMAScript 6 (aka ECMAScript 2015) and beyond. The current version of modern frameworks (such as React, Angular 2, and Ionic 2) are also built on top of ECMAScript 6 and beyond.
To support modern application development, and to integrate nicely with these frameworks, ForceJS is now built on top of ECMAScript 6 as well.  

## Compatible with ECMAScript 5

The ECMAScript 6 source files are compiled into an ECMAScript 5 compatible version. The ECMAScript 5 compatible files are available in the `dist` directory. The ECMAScript 5 files support the Universal Module Definition (UMD) format. In other words, they can be used with AMD or CommonJS module loaders as well as globally using the `force.OAuth` and `force.DataService` variables.

> The original ECMAScript 5-only version of forcejs is still available in the [es5 branch](https://github.com/ccoenraets/forcejs/tree/es5) of this repository. The es5 branch is no longer actively developed.

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

ForceJS is built on a modular architecture. It currently includes two modules:

- **forcejs/oauth**: A module that makes it easy to authenticate with Salesforce using the OAuth User Agent workflow
- **forcejs/data-service**: A module that makes it easy to access data through the Salesforce APIs

`forcejs/oauth` and `forcejs/data-service` are typically used together in an application, but you can use them separately. For example, you could use **forcejs/oauth** by itself if all you need is a Salesforce access token (Lightning Out use cases). Similarly, you could use **forcejs/data-service** by itself if you already have an access token, and all you need is a simple library to access the Salesforce APIs.

## Browser and Cordova Abstraction

ForceJS can be used to develop browser-based apps or hybrid mobile apps using the Salesforce Mobile SDK and Apache Cordova. If you develop a hybrid application using the Salesforce Mobile SDK, you often switch back and forth between running the app in the browser and on device. Developing in the browser is generally faster and easier to debug, but you still need to test device-specific features and check that everything runs as expected on the target platforms. The problem is that the configuration of OAuth and REST is different when running in the browser and on device. Here is a summary of the key differences:

<table>
<tr><td></td><td><strong>Browser</strong></td><td><strong>Mobile SDK</strong></td></tr>
<tr><td>Requires Proxy</td><td>Yes(*)</td><td>No</td></tr>
<tr><td>OAuth</td><td>Window Popup</td><td>OAuth Plugin</td></tr>
</table>

(*) Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS.

ForceJS abstracts these differences and allows you to run your app in the browser and on device without code or configuration changes.

## ECMAScript 6 Usage

```javascript
import {OAuth, DataService} from 'forcejs';

let oauth = OAuth.createInstance();
oauth.login().then(oauthResult => DataService.createInstance(oauthResult));

let loadContacts = () => {
    let service = DataService.getInstance();
    service.query('select id, Name from contact LIMIT 50')
        .then(response => {
            let contacts = response.records;
            // do something with contacts
    });
}
```

If you are only using one of the forcejs submodules (either oauth or data), the following import syntax is recommended to make sure the compiled version does not include the module you don't use if your build tool doesn't support tree shaking:

``` javascript
import OAuth from 'forcejs/oauth';
//or
import DataService from 'forcejs/data-service';
```

Because current browsers don't yet support all the ECMAScript 6 features, you need to use a build tool to compile (transpile) your ECMAScript 6 code to ECMAScript 5 compatible code, and provide the module loading infrastructure.
Webpack, Browserify, and Rollup are popular options. Webpack instructions are provided in the Quick Start sections below. Frameworks like React, Angular 2, and Ionic 2 already come with a build process. If you are using these frameworks, no additional step is necessary.

## ECMAScript 5 Usage

Use the ECMAScript 5 compatible files available in the `dist` directory.

```html
<script src="force.all.js"></script>
<script>
    var oauth = force.OAuth.createInstance();
    oauth.login().then(function(oauthResult) {
        force.DataService.createInstance(oauthResult);    
    });

    function loadContacts() {
        var service = force.DataService.getInstance();
        service.query('select id, Name from contact LIMIT 50')
            .then(function(response) {
                var contacts = response.records;
                // do something with contacts
            });
    }
</script>
```

If you are only using one of the forcejs modules (either oauth or data), the following  syntax is recommended to avoid including modules you don't use:

```html
<script src="force.oauth.js"></script>
// or
<script src="force.data-service.js"></script>

var oauth = force.OAuth.createInstance();
// or
var service = force.DataService.createInstance(oauthResult);
```

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

1. In your project's root directory, create a file named `webpack.config.js`:

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

1. In your project's root directory, create a file named `index.html`:

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

1. In your project's root directory, create a file named `app.js`:

    ```
    import {OAuth, DataService} from 'forcejs';

    let oauth = OAuth.createInstance();
    oauth.login()
        .then(oauthResult => {
            DataService.createInstance(oauthResult);
            loadContacts();
        });

    let loadContacts = () => {
        let service = DataService.getInstance();
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

## Quick Start 2: Hybrid Mobile App with Cordova and the Mobile SDK

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
        "start": "force-server --root www"
    },
    ```

1. In your project's root directory, create a file named `webpack.config.js`:

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

1. In your project's root directory, create a directory called `app`

1. In the `app` directory, create a file named `app.js`:

    ```
    import {OAuth, DataService} from 'forcejs';

    let oauth = OAuth.createInstance();
    oauth.login()
        .then(oauthResult => {
            DataService.createInstance(oauthResult);
            loadContacts();
        });

    let loadContacts = () => {
        let service = DataService.getInstance();
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

1. Run the app on your iOS device:
    - Open `platforms/ios/myforcejsapp.xcodeproj` in Xcode
    - Click `myforcejsapp` in the left sidebar
    - In the `Signing` section, select a team corresponding to a valid certificate
    - Click the Run button in the toolbar to run the application on your device.    

## API Reference

### forcejs/oauth

Basic Usage:

    import OAuth from "forcejs/oauth";
    let oauth = OAuth.createInstance();
    oauth.login().then(result => {
        console.log(result); // Prints access token, instance URL, and refresh token (if any)
    });

#### createInstance(appId, loginURL, oauthCallbackURL)

- **appId**

    The Salesforce Connected App Id. For convenience, ForceJS uses a default connected app if the appId is not provided. The default connected app supports http://localhost:8200/oauthcallback.html as the OAuth callback URL to provide an out-of-the-box development experience using force-server. You need to create your own connected app with your own OAuth callback URL to run your application on a different server and port.

    *Optional*

    *Default:* 3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92

- **loginURL**

    The URL for the login window that should be used as part of the OAuth process.

    *Optional*

    *Default*: https://login.salesforce.com

- **oauthCallbackURL**

    The URL Salesforce calls back with an authenticated access token (or an error) at the end of the OAuth authentication workflow.

    *Optional*

    *Default*: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default OAuth callback URL is http://localhost:8200/oauthcallback.html. If you load the app from https://myserver.com/myapp, the default OAuth callback URL is https://myserver.com/myapp/oauthcallback.html

#### login()

  Starts the User Agent OAuth workflow using a popup window when running in the browser or the oauth plugin when running in Cordova.

  - **Return Value**: A promise. When resolved, an object with the following fields is provided: **appId**, **accessToken**, **instanceURL**, **refreshToken**, and **userId**.

## forcejs/data-service

Basic Usage:

    import Oauth from "forcejs/oauth";
    import Service from "forcejs/data-service";
    let oauth = OAuth.createInstance();
    oauth.login().then(oauthResult => {
        Service.createInstance(oauthResult);
    });

#### createInstance(oauth, options, name)

- **oauth**. Required. An object with the following fields:

    - **accessToken**

        The authenticated access token

        Required, no default

    - **instanceURL**

        The Salesforce instance URL

        Required, no default

    - **refreshToken**

        The refresh token

        Optional, no default

- **options**. Optional. An object with the following fields:

    - **useProxy**.

        By default, ForceJS will automatically determine if it needs to use a CORS proxy: It won't use a proxy if the app is running inside a Visualforce page or a Cordova app, and will use the proxy in any other case. You can force ForceJS to always use a proxy by setting this value to true.

        Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS. If you whitelist your domain and use APIs that support CORS, you can set useProxy to false.

        Optional. Default: **false** if the app is running in Cordova or in a Visualforce page, **true** if it's not.

    - **proxyURL**.

        The URL of the CORS proxy server. This parameter is ignored when the app is running in Cordova or inside a Visualforce page.

        Optional. Default: The base URL the application was loaded from. For example, if you load the app from http://localhost:8200, the default proxyURL is http://localhost:8200. If you load the app from https://myserver.com/myapp, the default proxyURL is https://myserver.com/myapp

    - **apiVersion**

        The version of the Salesforce API.

        Optional. Default: v36.0

- **name**

    By default createInstance() creates a singleton instance which is what you want when your app works with a single Salesforce org. If you are building an app that connects to multiple Salesforce instances, provide a name that identifies the instance. For example:

    ```
    createInstance(oauth, options, "sales");
    ```

    You can later retrieve that specific instance using:

    ```
    getInstance("sales");
    ```

    Optional. Default: none. If a name is not provided a singleton instance is created. If a name is provided, a named instance is provided.

#### getInstance(name)

- **name**

    The name of the instance you want to retrieve.

    Optional. If omitted, returns the singleton instance. If specified, return the named instance.

#### getUserId()

- **Return Value**: the id of the authenticated user.    


#### query(soql)

Used to execute a SOQL statement

- **soql**: The SOQL statement
- **batch** (optional): save query for batch call - see more under **.batch()**

- **Return Value**: Promise

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

- **objectName**. Required.
- **valueObject**. Required.
- **batch** (optional): save query for batch call - see more under **.batch()**
- **Return Value**: Promise. When the promise is resolved, an object with the following fields is provided:
    - **errors**: an array of errors (if any)
    - **id**: the record id of the record that was created
    - **success**: true or false

Example:

```
service.create('contact', {FirstName: "Lisa", LastName: "Jones"})
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    });
```

#### update(objectName, valueObject)

Used to update a record

- **objectName**. Required.
- **valueObject**. Required. The object must include and Id (or id) field to identify the record to update.
- **batch** (optional): save query for batch call - see more under **.batch()**
-
- **method**. Optional POST/PATCH

- **Return Value**: Promise

Example:

```
service.update('contact', {Id: "0031a000001x7DOAAY", FirstName: "Emma", LastName: "Wong"})
    .then() => {
        console.log("Update successful");
    })
    .catch(error => {
        console.log(error);
    });
```

#### del(objectName, recordId)

Used to delete a record

- **objectName**. Required.
- **recordId**. Required.
- **batch** (optional): save query for batch call - see more under **.batch()**

- **Return Value**: Promise

Example:

```
service.del('contact', "0031a000001x7DOAAY",
    .then() => {
        console.log("Delete successful");
    })
    .catch(error => {
        console.log(error);
    });
```

#### upsert(objectName, externalIdField, externalId, data)

Used to upsert a record

Example:

```
service.upsert('contact', 'My_Contact_Id__c', '101', {FirstName: "Emma", LastName: "Wong"})
    .then() => {
        console.log("Upsert successful");
    })
    .catch(error => {
        console.log(error);
    });
```



#### retrieve(objectName, recordId, fields)

Used to retrieve a single record

- **objectName**. Required.
- **recordId**. Required.
- **fields**. Optional. Array of fields to retrieve. If omitted, all available fields are retrieved.
- **batch** (optional): save query for batch call - see more under **.batch()**

- **Return Value**: Promise

Example:

```
service.retrieve('contact', id)
    .then(contact => {
        console.log(contact);
    })
    .catch(error => {
        console.log(error);
    });
```

#### reports(recordId)

Used to return reports

- **recordId**. optional if empty it return all created reports.
- **batch** (optional): save query for batch call - see more under **.batch()**

- **Return Value**: Promise

Example:

```
service.reports()
    .then(contact => {
        console.log(reports);
    })
    .catch(error => {
        console.log(error);
    });
```

#### dasboard(recordId)

Used to return dashboards

- **recordId**. optional if empty it return all created dashboards.
- **batch** (optional): save query for batch call - see more under **.batch()**

- **Return Value**: Promise

Example:

```
service.dashboard()
    .then(contact => {
        console.log(reports);
    })
    .catch(error => {
        console.log(error);
    });
```

#### apexrest(urlMapping)

Used to invoke a custom REST service endpoint implemented by your own Apex class.

- **urlMapping**. Required. Value of the urlMapping annotation in your Apex class.

- **Return Value**: Promise

Example:

```
force.apexrest("contacts")
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.log(error);
    });
```

#### request(obj)

The core method to invoke a REST services. Other functions (query, create, update, del, upsert, apexrest) are just convenience functions invoking request() behind the scenes. You can use request() directly to invoke other REST services that are not directly exposed through a convenience function.

Example:

```
force.request({path: "/services/data-service"})
    .then(result => {
        console.log(result)
    })
    .catch(error => {
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

#### chatter(obj)

A convenience function to use the Chatter API

Example:

```
force.chatter({path: "/users/me"})
    .then(result => {
        console.log(result)
    })
    .catch(error => {
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

#### versions()

Lists summary information about each Salesforce.com version currently available, including the version, label, and a link to each version's root.

#### resources()

Lists available resources for the client's API version, including resource name and URI.

#### describeGlobal()

Lists the available objects and their metadata for your organization's data.

#### metadata(objectName)

Describes the individual metadata for the specified object.

- **objectName** Object name; e.g. "Account"
- **batch** (optional): save query for batch call - see more under **.batch()**

#### describe(objectName)

Completely describes the individual metadata at all levels for the specified object.

- **objectName**: object name; e.g. "Account"
- **batch** (optional): save query for batch call - see more under **.batch()**

#### describeLayout(objectName, recordTypeId)

Fetches the layout configuration for a particular sobject name and record type id.

- **objectName**: object name; e.g. "Account"
- **recordTypeId** (optional): Id of the layout's associated record type
- **batch** (optional): save query for batch call - see more under **.batch()**

#### queryMore(url)

Queries the next set of records based on pagination.
This should be used if performing a query that retrieves more than can be returned
in accordance with http://www.salesforce.com/us/developer/docs/api_rest/Content/dome_query.htm

- **url**: the url retrieved from nextRecordsUrl or prevRecordsUrl
- **batch** (optional): save query for batch call - see more under **.batch()**

#### search(sosl)

Executes the specified SOSL search.

- **sosl**: a string containing the search to execute - e.g. "FIND {needle}"
- **batch** (optional): save query for batch call - see more under **.batch()**


#### batch(requests)

Executes batch commands
the batch parameter in the other calls like query, create will save the request for the batch.
So you have to call before you execute this function.
Important note:
In API version 34.0 and later, subrequests can be calls to the Limits, SObject, Query/QueryAll, Search, Connect,
and Chatter resources. API version 35.0 adds the ability to use Actions resources.


- requests: Promises from the other calls like

```
// don't do it in production with nested promises :) Chain it or use observals
    let query: string = 'SELECT id FROM Contact LIMIT 10';
    let query1: string = 'SELECT id FROM Contact LIMIT 20';
    let query2: string = 'SELECT id FROM Contact LIMIT 30';

    DataService.getInstance().query(query, true).then(q1 => {
      DataService.getInstance().query(query1, true).then(q2 => {
        DataService.getInstance().query(query2, true).then(q3 => {
          DataService.getInstance().batch([q1, q2, q3]).then((response) => {
            console.log(q1, q2, q3);
            console.log(response);
          });
        });
      });
    });
```

#### composite(request)
- request: Promises from the other calls like