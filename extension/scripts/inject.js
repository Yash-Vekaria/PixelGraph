// ********************** STORAGE APIs **********************

// Extracting the original functions responsible for getting and setting cookies using document.cookie by binding .this to document
// These enable normal functioning of the page in case of errors in overriden logic or to perform normal functionality
var cookieGetter = document.__lookupGetter__("cookie").bind(document);
var cookieSetter = document.__lookupSetter__("cookie").bind(document);

// Monitoring access to document.cookie
Object.defineProperty(document, 'cookie', {
    // overriding getting document.cookie
    get: function() {
        var storedCookieStr = cookieGetter();
        // Sending the get data to localhost server
        fetch("http://localhost:8000/storage", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "cookie_getter",
                "cookie": storedCookieStr,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("get CookieStorage collected.");
        }).catch(err => {
            console.error("Error in getting cookie:", err);
        });
        // Ensuring normal functionality
        return cookieGetter();
    },
    // overriding setting document.cookie
    set: function(cookieString) {
        // Sending the get data to localhost server
        fetch("http://localhost:8000/storage", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "cookie_setter",
                "cookie": cookieString,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("set CookieStorage collected.");
        }).catch(err => {
            console.error("Error in setting cookie:", err);
        });
        // Ensuring normal functionality
        return cookieSetter(cookieString);
    }
});

// Monitoring access to local and session storage to get any information as key
// Storing the original function prototype of getItem for usage under error or to perform normal functionality
let getStorageFunction = window.Storage.prototype.getItem;
// Overriding getItem
window.Storage.prototype.getItem = function(keyName) {
    try{
        // Performing normal functionality of getItem
        getStorageFunction.apply(this, arguments);
        // Sending the get data to localhost server
        fetch("http://localhost:8000/storage", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "storage_getter",
                "storage": {
                    keyName
                },
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("get Storage collected.");
        });
        return;
    }
    catch(err){
        // Ensuring normal functionality in case of error
        getStorageFunction.apply(this, arguments);
    }
}

// Monitoring access to local and session storage to set any information as key, value pair
// Storing the original function prototype of setItem for usage under error or to perform normal functionality
let setStorageFunction = window.Storage.prototype.setItem;
// Overriding setItem
window.Storage.prototype.setItem = function(keyName, keyValue) {
    try{
        // Performing normal functionality of setItem
        setStorageFunction.apply(this, arguments);
        // Sending the set data to localhost server
        fetch("http://localhost:8000/storage", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "storage_setter",
                "storage": {
                    "keyName": keyName,
                    "keyValue": keyValue
                },
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("set Storage collected.");
        });
        return;
    }
    catch(err){
        // Ensuring normal functionality in case of error
        setStorageFunction.apply(this, arguments);
    }
}


// ********************** EVENT APIs **********************

// Monitoring addition of EventListener()'s
// Storing the original function prototype of addEventListener for usage under error or to perform normal functionality
var addEventListnerPrototype = EventTarget.prototype.addEventListener;
// Overriding addEventListener
EventTarget.prototype.addEventListener = function(type, func, capture) {
    try{
        addEventListnerPrototype.apply(this, arguments)
        // Sending the data about tracked events to localhost server
        fetch("http://localhost:8000/eventSet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": 'addEventListener',
                "type": type,
                "function": func,
                "capture": capture,
                "this": JSON.stringify(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("addEventListener collected.");
        });
        return
    }
    catch(err){
        // Ensuring normal functionality
        addEventListnerPrototype.apply(this, arguments)
    }
}

// Monitoring removal of EventListener()'s
// Storing the original function prototype of removeEventListener for usage under error or to perform normal functionality
var removeEventListenerPrototype = EventTarget.prototype.removeEventListener;
// Overriding removeEventListener
EventTarget.prototype.removeEventListener = function(type, fn, capture) {
    try{
        removeEventListenerPrototype.apply(this, arguments)
        // Sending the data about events stopped from being tracked to localhost server
        fetch("http://localhost:8000/eventSet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": 'removeEventListener',
                "type": type,
                "function": fn,
                "capture": capture,
                "this": String(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("removeEventListener collected.");
        }); 
        return
    }
    catch(err){
        // Ensuring normal functionality
        removeEventListenerPrototype.apply(this, arguments)
    }
}

// Monitoring setting/adding of attribute
// Storing the original function prototype of setAttribute for usage under error or to perform normal functionality
var setAttributePrototype = Element.prototype.setAttribute;
// Overriding setAttribute
Element.prototype.setAttribute = function(name, value) {
    try{
        setAttributePrototype.apply(this, arguments)
        // Sending the data about setting attribute events to localhost server
        fetch("http://localhost:8000/eventSet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": "setAttribute",
                "name": name,
                "value": value,
                "this": String(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("setAttribute collected.");
        });
        return
    }
    catch(err){
        // Ensuring normal functionality
        setAttributePrototype.apply(this, arguments)
    }
}

// Monitoring getting of attribute
// Storing the original function prototype of getAttribute for usage under error or to perform normal functionality
var getAttributePrototype = Element.prototype.getAttribute;
// Overriding getAttribute
Element.prototype.getAttribute = function(name) {
    try{
        getAttributePrototype.apply(this, arguments)
        // Sending the data about getting attribute events to localhost server
        fetch("http://localhost:8000/eventGet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": "getAttribute",
                "name": name,
                "this": String(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("getAttribute collected.");
        });
        return
    }
    catch(err){
        // Ensuring normal functionality
        getAttributePrototype.apply(this, arguments) 
    }
}

// Monitoring removal of attribute
// Storing the original function prototype of removeAttribute for usage under error or to perform normal functionality
var removeAttributePrototype = Element.prototype.removeAttribute;
// Overriding removeAttribute
Element.prototype.removeAttribute = function(name) {
    try{
        removeAttributePrototype.apply(this, arguments)
        // Sending the data about attribute removal events to localhost server
        fetch("http://localhost:8000/eventSet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": "removeAttribute",
                "name": name,
                "this": String(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("removeAttribute collected.");
        }); 
        return
    }
    catch(err){
        // Ensuring normal functionality
        removeAttributePrototype.apply(this, arguments) 
    }
}


// ********************** ELEMENT APIs **********************

// Monitoring createElement
// Storing the original document.createElement function
var originalCreateElement = document.createElement.bind(document);

// Overriding document.createElement
document.createElement = function(tagName, options) {
    console.log('Creating the element:', tagName);
    // Sending the data about createElement to localhost server
    fetch("http://localhost:8000/element", {
        method: "POST",
        body: JSON.stringify({
            "top_level_url": window.location.href,
            "function": "createElement",
            "tagName": tagName,
            "options": JSON.stringify(options),
            "this": String(this),
            "stack": new Error().stack
        }),
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-Type": "application/json"
        }
    }).then(res => {
        console.log("createElement data sent to server.");
    }).catch(err => {
        console.error("Error sending createElement data:", err);
    });
    // Ensuring normal functionality
    return originalCreateElement(tagName, options);
};


// ********************** PROPERTY APIs **********************

// Monitoring window.name
// Extracting the original functions responsible for getting and setting name using window.name by binding .this to document
// These enable normal functioning of the page in case of errors in overriden logic or to perform normal functionality
var nameGetter = window.__lookupGetter__("name").bind(window);
var nameSetter = window.__lookupSetter__("name").bind(window);

// Monitoring access to window.name
Object.defineProperty(window, 'name', {
    // overriding getting window.name
    get: function() {
        var storedName = nameGetter();
        // Sending the get data to localhost server
        fetch("http://localhost:8000/property", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "name_getter",
                "name": storedName,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("getName property collected.");
        }).catch(err => {
            console.error("Error in getName:", err);
        });
        // Ensuring normal functionality
        return nameGetter();
    },
    // overriding setting window.name
    set: function(nameValue) {
        // Sending the set data to localhost server
        fetch("http://localhost:8000/property", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "name_setter",
                "name": nameValue,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("setName collected.");
        }).catch(err => {
            console.error("Error in setName:", err);
        });
        // Ensuring normal functionality
        return nameSetter(nameValue);
    }
});

// Monitoring document.referrer
// Extracting the original document.referrer value
var originalReferrer = document.referrer;

// Overriding document.referrer
Object.defineProperty(document, 'referrer', {
    get: function() {
        console.log('Getting document.referrer');
        // Sending the get data to localhost server
        fetch("http://localhost:8000/property", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "referrer_getter",
                "referrer": originalReferrer,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("Referrer data sent to server.");
        }).catch(err => {
            console.error("Error sending referrer data:", err);
        });
        // Ensuring normal functionality
        return originalReferrer;
    },
    set: function(newValue) {
        console.log('Setting document.referrer is not standard, but storing new value if explicitly done!');
        // Sending the attempted set data to localhost server
        fetch("http://localhost:8000/property", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "referrer_setter",
                "referrer": newValue,
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("New referrer data sent to server.");
        }).catch(err => {
            console.error("Error sending new referrer data:", err);
        });
        // Ensuring normal functionality
        // Since referrer is read only property
        // originalReferrer = newValue;
    },
    configurable: true // Ensuring this property can be redefined later if necessary
});

// Extracting a reference to the original screen object
const originalScreen = window.screen;

// Creating a proxy object to override screen properties
const screenProxy = new Proxy(originalScreen, {
    get(target, property) {
        console.log(`Accessing screen.${property}`);
        // Sending the accessed property to localhost server
        fetch("http://localhost:8000/property", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "function": "window.screen",
                "property": property,
                "propertyValue": target[property],
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Content-Type': "application/json",
                'Access-Control-Allow-Origin': '*'
            }
        }).then(res => {
            console.log(`screen.${property} accessed and sent to server.`);
        }).catch(err => {
            console.error(`Error sending screen.${property}:`, err);
        });
        // Ensuring the normal functionality
        return target[property];
    }
});

// Overriding window.screen with the proxy object
Object.defineProperty(window, 'screen', {
    get: function() {
        return screenProxy;
    },
    configurable: true
});


// ********************** NETWORK APIs **********************

// Monitoring sendBeacon
// Storing the original function prototype of sendBeacon for usage under error or to perform normal functionality
var sendBeaconPrototype = Navigator.prototype.sendBeacon;
// Overriding sendBeacon
Navigator.prototype.sendBeacon = function(url, data) {
    try{
        sendBeaconPrototype.apply(this, arguments)
        // Sending the data about sendBeacon to localhost server
        fetch("http://localhost:8000/eventSet", {
            method: "POST",
            body: JSON.stringify({
                "top_level_url": window.location.href,
                "event": 'sendBeacon',
                "url": url,
                "this": String(this),
                "stack": new Error().stack
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("sendBeacon collected.");
        });
        return
    }
    catch(err){
        // Ensuring normal functionality
        sendBeaconPrototype.apply(this, arguments)
    }
}