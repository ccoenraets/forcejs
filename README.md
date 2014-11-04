# ForceJS

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications. 
ForceJS allows you to easily login into Salesforce using OAuth, and to manipulate your Salesforce data using a simple 
API.

ForceJS is similar to [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit), but has no jQuery dependency and comes with an AngularJS version ([ForceNG](https://github.com/ccoenraets/forceng)). 

The main target for ForceJS are applications running on your own server (Heroku or elsewhere), or locally on a 
mobile device and accessing Salesforce through REST services. If your application is hosted inside Salesforce (in a 
Visualforce page), consider using Visualforce Remoting or Remote Objects to access your Salesforce data.  

This is an early version. I appreciate any feedback, comments, and help if you think this library is useful.
   
## Key Characteristics

- No jQuery dependency
- Plain JavaScript (ForceJS) and Angular Service ([ForceNG](https://github.com/ccoenraets/forceng)) versions
- Complete OAuth login workflow
- Works transparently in the browser and in Cordova using the In-App browser plugin or the Salesforce Mobile SDK plugin for OAuth (coming soon)
- Automatically refreshes OAuth access_token on expiration
- Simple API to manipulate data (create, update, delete, upsert)   
- Node.js or Play/Scala proxies with CORS support available separately
- Includes simple Bootstrap sample app 

## Usage

1. Initialize (Optional):

    ForceJS is built to work out of the box with sensible defaults. **You only need to invoke force.init() if you want to override these defaults**: 

    ```
    force.init({
        appId: '3MVG9fMtCkV6eLheIEZplMqWfnGlf3Y.BcWdOf1qytXo9zxgbsrUbS.ExHTgUPJeb3jZeT8NYhc.hMyznKU92',
        apiVersion: 'v32.0',
        loginUrl: 'https://login.salesforce.com',
        oauthRedirectURL: 'http://localhost:8200/oauthcallback.html',
        proxyURL: 'http://localhost:8200'
    });
    ```
    
   
2. Login:
    ```
    force.login(
        function() {
            console.log('Login succeeded');
        },
        function(error) {
            alert('Login failed: ' + error);
        });
    ```

3. Invoke a function: query(), create(), update(), delete(), upsert(), or the generic request():
    ```
    force.query('select id, firstName, lastName from contact',
        function(response) {
            console.log(response);
        },
        function(error) {
            console.log(error);
        });
    ```

## ForceServer

Because of the browser's cross-origin restrictions, your JavaScript application hosted on your own server (or localhost) will not be able to make API calls directly to the *.salesforce.com domain. The solution is to proxy your API calls through your own server. You can use your own proxy server, but to provide an integrated development experience, ForceJS works smoothly with ForceServer, a simple development server for Force.com. It provides two main features: 

- **A Proxy Server** to avoid cross-domain policy issues when invoking Salesforce REST services. (The Chatter API supports CORS, but other APIs don’t yet)
- **A Local Web Server** to (1) serve the OAuth callback URL defined in your Connected App, and (2) serve the whole app during development and avoid cross-domain policy issues when loading files (for example, templates) from the local file system.

Visit the [force-server repository](https://github.com/ccoenraets/force-server) for more information.


## Sample App

Create a file named index.html anywhere on you file system:

```
<html>
<body>
<ul id="list"></ul>
<script src="force.js"></script>
<script>
force.login(function() {
    force.query('select id, Name from contact LIMIT 50', function (response) {
        var str = '';
        for (var i = 0; i < response.records.length; i++) {
            str += '<li>' + response.records[i].Name + '</li>';
        }
        document.getElementById('list').innerHTML = str;
    });
});
</script>
</body>
</html>
```

## Run the Server

Navigate to the directory where you created index.html, and type:

```
force-server
``` 
    
This command will start the server on port 8200, and automatically load your app (http://localhost:8200) in a browser window. You'll see the Salesforce login window, and the list of contacts will appear after you log in.

You can change the port number and the web root. Type the following command for more info:

```
force-server --help
```

## Code Highlights

1. The sample application above uses the <a href="">ForceJS</a> library. ForceJS and ForceServer are built to work closely together and provide an integrated developer experience.
1. ForceJS uses a default connected app: No need to create a connected app to start development. You should however create your own connected app for production use.
1. ForceServer automatically serves the OAuth callback URL: No need to create a callback HTML page during development.


## Transparently Running Hybrid Apps on Device and in the Browser

If you develop a hybrid application using the Mobile SDK, you often switch back and forth between running the app in the browser and on device: Developing in the browser is generally faster and easier to debug, but you still need to test device-specific features and check that everything runs as expected on the target platforms. The problem is that the configuration of OAuth and REST is different when running in the browser and on-device. Here is a summary of the key differences:

<table>
<tr><td></td><td><strong>Browser</strong></td><td><strong>Device</strong></td></tr>
<tr><td>Proxy</td><td>Yes</td><td>No</td></tr>
<tr><td>OAuth</td><td>Popup</td><td>Plugin</td></tr>
</table>

ForceJS abstracts these differences and allows you to run your app in the browser and on device without code or configuration change.


## AngularJS version

An AngularJS version (ForceNG) implemented as a service and using promises instead of callback functions is available
 [here](https://github.com/ccoenraets/forceng).

## Other Libraries

- [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit): Proven toolkit for Salesforce REST APIs. Leverages jQuery.
- [NForce](https://github.com/kevinohara80/nforce): node.js a REST API wrapper for force.com, database.com, and salesforce.com.
- [ngForce](https://github.com/noeticpenguin/ngForce): Streamlined Visualforce Remoting integration in your AngularJS apps running in a Visualforce page  
- [JSForce](http://jsforce.github.io/): Integrate your JavaScript application with Salesforce in different scenarios