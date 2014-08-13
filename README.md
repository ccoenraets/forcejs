# ForceJS

ForceJS is a micro-library that makes it easy to use the Salesforce REST APIs in JavaScript applications. 
ForceJS allows you to easily login into Salesforce using OAuth, and to manipulate your Salesforce data using a simple 
API.

ForceJS is similar to [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit), but has no jQuery dependency and comes with an AngularJS version ([ForceNG](https://github.com/ccoenraets/forceng)). 

The main target for ForceJS are applications running on your own server (Heroku or elsewhere), or locally on a 
mobile device and accessing Salesforce through REST services. If your application is hosted inside Salesforce (in a 
Visualforce page), consider using Visualforce Remoting or Remote Objects to access your Salesforce data.  

This is an early version. I appreciate any feedback, comments, and help if you think this library is useful.
   
### Key Characteristics

- No jQuery dependency
- Plain JavaScript (ForceJS) and Angular Service ([ForceNG](https://github.com/ccoenraets/forceng)) versions
- Complete OAuth login workflow
- Works transparently in the browser and in Cordova using the In-App browser plugin or the Salesforce Mobile SDK plugin for OAuth (coming soon)
- Automatically refreshes OAuth access_token on expiration
- Simple API to manipulate data (create, update, delete, upsert)   
- Node.js or Play/Scala proxies with CORS support available separately
- Includes simple Bootstrap sample app 

### Usage

1. Initialize:
    ```
    force.init({
        appId: 'SALESFORCE_CONNECTED_APP_CLIENT_ID',
        proxyURL: 'https://simple-cors-proxy.herokuapp.com'
    });
    ```
    
    > Create a **Connected Application** in Salesforce to get a client id. Make sure you specify the right path to oauthcallback.html as the Callback URL. Read [these instructions](http://ccoenraets.github.io/salesforce-developer-workshop/Using-the-Salesforce1-Platform-APIs.html) (step1 only) if you don't know how to create a Connected App.
    
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

### AngularJS version

An AngularJS version (ForceNG) implemented as a service and using promises instead of callback functions is available
 [here](https://github.com/ccoenraets/forceng).

### Proxy Server

Because of the browser's cross-origin restrictions, your JavaScript application hosted on your own server (or localhost) will not be able to make API calls directly to the *.salesforce.com domain. The solution is to proxy your API calls through your own server. ForceJS has been tested with two proxy servers:
- [cors-proxy](https://github.com/ccoenraets/cors-proxy): A node.js implementation
- [sf-cors-proxy](https://github.com/jamesward/sf-cors-proxy): A Scala / Play implementation by James Ward

You can use ForceJS with your own proxy server as well.

### Other Libraries

- [ForceTK](https://github.com/developerforce/Force.com-JavaScript-REST-Toolkit): Proven toolkit for Salesforce REST APIs. Leverages jQuery.
- [NForce](https://github.com/kevinohara80/nforce): node.js a REST API wrapper for force.com, database.com, and salesforce.com.
- [ngForce](https://github.com/noeticpenguin/ngForce): Streamlined Visualforce Remoting integration in your AngularJS apps running in a Visualforce page  
- [JSForce](http://jsforce.github.io/): Integrate your JavaScript application with Salesforce in different scenarios
