//Import the force module
import OAuth from './oauth-user-agent';
import Service from './force-service';

let list = document.getElementById('contactList'),
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

    oauth = OAuth.createInstance();

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

let service;

let errorHandler = error => {
    alert(`An error has occurred`);
    console.log(error);
}

let login = event => {
    event.preventDefault();
    oauth.login()
        .then(result => {
            console.log(result);
            service = Service.createInstance(result);
            alert('Salesforce login succeeded')
        })
        .catch((error) => {
            console.log(error);
            alert('Salesforce login failed');
        });
};

let query = () => {

    // Empty list
    list.innerHTML = '';

    // Retrieve contacts
    service.query('select id, firstName, lastName from contact LIMIT 50')
        .then(response => {
            let str = '';
            let contacts = response.records;
            for (let i=0; i < contacts.length; i++) {
                str += '<a href="#' + contacts[i].Id + '" class="list-group-item">' + contacts[i].FirstName + ' '
                    + contacts[i].LastName + '</a>';
            }
            list.innerHTML = str;
        })
        .catch(errorHandler);
}

function create() {
    service.create('contact', {FirstName: firstNameField.value, LastName: lastNameField.value})
        .then(function(response) {
            console.log(response);
        })
        .catch(errorHandler);
}

function update() {
    service.update('contact', {Id: idField.value, FirstName: firstNameField.value, LastName: lastNameField.value})
        .then(function(response) {
            console.log(response);
        })
        .catch(errorHandler);
}

function del() {
    service.del('contact', idField.value)
        .then(function(response) {
            console.log(response);
        })
        .catch(errorHandler);
}

function retrieve(id) {
    service.retrieve('contact', id, null)
        .then(function(contact) {
            console.log(contact);
            idField.value = contact.Id;
            firstNameField.value = contact.FirstName;
            lastNameField.value = contact.LastName;
            createBtn.style.display = 'none';
            updateBtn.style.display = 'inline';
            deleteBtn.style.display = 'inline';

        })
        .catch(errorHandler);
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
    let id = window.location.hash.substr(1);
    retrieve(id);
}

loginBtn.addEventListener("click", login);
discardTokenBtn.addEventListener("click", discardToken);
isLoggedInBtn.addEventListener("click", isLoggedIn);
queryBtn.addEventListener("click", query);
newBtn.addEventListener("click", newContact);
updateBtn.addEventListener("click", update);
createBtn.addEventListener("click", create);
deleteBtn.addEventListener("click", del);