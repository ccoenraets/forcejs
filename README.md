# ForceJS
### REST Library for the Salesforce Platform 

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications.
ForceJS allows you to easily login to Salesforce using OAuth, and to manipulate your Salesforce data using a simple
API.

ForceJS is similar to [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit), but has no jQuery dependency and comes with an AngularJS version ([ForceNG](https://github.com/ccoenraets/forceng)).

The main target for ForceJS are applications running on your own server (Heroku or elsewhere) and Cordova/Mobile SDK applications.  

## Browser and Cordova without Code Changes

If you develop a hybrid application using the Mobile SDK, you often switch back and forth between running the app in the browser and on device: Developing in the browser is generally faster and easier to debug, but you still need to test device-specific features and check that everything runs as expected on the target platforms. The problem is that the configuration of OAuth and REST is different when running in the browser and on device. Here is a summary of the key differences:

<table>
<tr><td></td><td><strong>Browser</strong></td><td><strong>Mobile SDK</strong></td></tr>
<tr><td>Requires Proxy</td><td>Yes</td><td>No</td></tr>
<tr><td>OAuth</td><td>Window Popup</td><td>OAuth Plugin</td></tr>
</table>

ForceJS abstracts these differences and allows you to run your app in the browser and on device without code or configuration changes.

## Key Characteristics

- No jQuery (or any other) dependency
- Plain JavaScript (ForceJS) and Angular Service ([ForceNG](https://github.com/ccoenraets/forceng)) versions
- Complete OAuth login workflow
- Works transparently in the browser and in Cordova using the Salesforce Mobile SDK OAuth plugin
- Automatically refreshes OAuth access_token on expiration
- Tightly integrated with [ForceServer](https://github.com/ccoenraets/force-server), a local development server that works as a proxy and a local web server to provide a streamlined developer experience
- Simple API to manipulate data (create, update, delete, upsert)


## Quick Start

To create and run a minimalistic sample app using ForceJS:

1. Create a directory anywhere on your file system, copy force.js in that directory, and create a file named index.html implemented as follows:

    ```
    <html>
        <body>
        <ul id="list"></ul>
        <script src="cordova.js"></script>
        <script src="force.js"></script>
        <script>
        force.login(function() {
            force.query('select id, Name from contact LIMIT 50', function (response) {
                var html = '';
                for (var i = 0; i < response.records.length; i++) {
                    html += '<li>' + response.records[i].Name + '</li>';
                }
                document.getElementById('list').innerHTML = html;
            });
        });
        </script>
        </body>
    </html>
    ```

    That's it! This is all you need to authenticate with OAuth, retrieve a list of contacts from Salesforce, and display that list in HTML.
    
    > The ```<script src="cordova.js"></script>``` line is there to support running the app in Cordova. Note that the ```cordova.js``` file does not have to be present in your directory: it is automatically injected by the Cordova build process. If you know you will never run your app in Cordova, feel free to remove that line.

1. Install force-server

    Because of the browser's cross-origin restrictions, your JavaScript application hosted on your own server (or localhost) will not be able to make API calls directly to the *.salesforce.com domain. The solution is to proxy your API calls through your own server. You can use your own proxy server, but ForceJS is tightly integrated with [ForceServer](https://github.com/ccoenraets/force-server), a simple development server for Force.com. To install ForceServer, make sure Node.js is installed on your system, open a command prompt and execute the following command:

    ```
    npm install -g force-server
    ```

    On a Mac, you may have to use sudo:

    ```
    sudo npm install -g force-server
    ```
    
1. Run the application.

    Open a command prompt, navigate to your sample app directory and type the following command:

    ```
    force-server
    ```

    This starts the ForceServer server on port 8200 and loads your sample app in your default browser. After authenticating against your developer org, you should see a list of contacts.  

> Starting in the Spring 15 release, some Salesforce REST APIs (like Chatter and sobjects) support CORS. To allow an app to make direct REST calls against your org, register the app domain in Setup: Administer > Security Controls > CORS.

## Running in Cordova with the Mobile SDK

To run the same application in Cordova:

1. Install Cordova:

    ```
    npm install -g cordova
    ```
    
    On a Mac, you may have to use sudo:

    ```
    sudo npm install -g cordova
    ```

1. Create a new application:

    ```
    cordova create contactforce com.samples.contactforce contactforce
    ```
    
1. Navigate (cd) to the project directory

    ```
    cd contactforce
    ```

1. Add the Salesforce Mobile SDK plugin:

    ```
    cordova plugin add https://github.com/forcedotcom/SalesforceMobileSDK-CordovaPlugin
    ```

1. Delete the contents of the ```contactforce/www``` directory

1. Copy ```force.js``` and the ```index.html``` file created above in the ```contactforce/www``` directory

1. Create a file named bootconfig.json (the Salesforce Mobile SDK config file) in the ```contactforce/www``` directory and implement it as follows:

    ```
    {
      "remoteAccessConsumerKey": "3MVG9Iu66FKeHhINkB1l7xt7kR8czFcCTUhgoA8Ol2Ltf1eYHOU4SqQRSEitYFDUpqRWcoQ2.dBv_a1Dyu5xa",
      "oauthRedirectURI": "testsfdc:///mobilesdk/detect/oauth/done",
      "oauthScopes": [
        "web",
        "api"
      ],
      "isLocal": true,
      "startPage": "index.html",
      "errorPage": "error.html",
      "shouldAuthenticate": true,
      "attemptOfflineLoad": false
    }
    ```
    
    > For a production application, you should create a Connected App in Salesforce and provide your own Connected App ID and Callback URI.

6. Add a platform. For example, to add iOS:

    ```
    cordova platform add ios
    ```
    
7. Build the project:

    ```
    cordova build ios
    ```

Run the project. For example, for iOS, open the project (platforms/ios/contactforce.xcodeproj) in Xcode and run it in the emulator or on your iOS device. After authenticating against your developer org, you should see a list of contacts.  

> Note that you didn't change any code to run the app in Cordova. When running in Cordova, ForceJS automatically uses the Salesforce Mobile SDK OAuth plugin, and invokes REST services without using a proxy because the webview used in Cordova is not subject to the same cross domain policy restrictions.

## Other Samples

- Contact Management with Bootstrap: A complete contact management sample (Retrieve, Create, Update, Delete) shipping with this repository

- [SOQL Explorer](https://github.com/ccoenraets/soql-explorer)

- [Contact Management with React](https://github.com/ccoenraets/salesforce-contacts-react)


## Using ForceJS in Visualforce Pages

Even though you should consider using Visualforce Remoting or Remote Objects to avoid the governor limits related to the REST APIs, you can run ForceJS in Visualforce pages. To run a Visualforce page version of the sample above, upload force.js as a static resource and create a Visualforce page defined as follows: 

```
<apex:page>

    <ul id="list"></ul>

    <script src="{!$Resource.forcejs}"></script>
    <script>

        force.init({accessToken: "{!$Api.Session_ID}"});
        force.query('select id, Name from contact LIMIT 50', function (response) {
			var html = '';
            for (var i = 0; i < response.records.length; i++) {
				html += '<li>' + response.records[i].Name + '</li>';
            }
            document.getElementById('list').innerHTML = html;
		});

    </script>

</apex:page>
```

> Notice that in this case, you don't have to login: you just initialize ForceJS with the existing session id.

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


## AngularJS version

An AngularJS version (ForceNG) implemented as a service and using promises instead of callback functions is available
 [here](https://github.com/ccoenraets/forceng).

## Other Libraries

ForceJS was built based on the following requirements:

- Client-side REST library 
- Minimalistic with no dependency
- Full OAuth workflow
- Browser and Cordova-based execution without code or configuration changes

Depending on your own requirements, you should also consider the following libraries:  

- [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit): Proven toolkit for Salesforce REST APIs. Leverages jQuery.
- [NForce](https://github.com/kevinohara80/nforce): node.js REST API wrapper for force.com, database.com, and salesforce.com.
- [ngForce](https://github.com/noeticpenguin/ngForce): A set of Angular.js modules that facilitate quick and sustainable Angular.js application development on the Force.com Platform. 
- [JSForce](http://jsforce.github.io/): Integrate your JavaScript application with Salesforce in different scenarios
