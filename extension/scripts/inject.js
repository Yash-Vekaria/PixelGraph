// Sending data from overriden functions to localhost server
function sendDataToServer(path, data) {
    fetch(`http://localhost:8000/${path}`, {
        method: "POST",
        body: JSON.stringify(data),
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-Type": "application/json"
        }
    }).then(res => {
        console.log(`${data.function} data sent to server.`)
    }).catch(err => {
        console.error(`Error in sending ${data.function}:`, err)
    });
}


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
        sendDataToServer("storage", {"top_level_url": window.location.href, "function": "cookieGetter", "cookie": storedCookieStr, "stack": new Error().stack});
        // Ensuring normal functionality
        return cookieGetter();
    },
    // overriding setting document.cookie
    set: function(cookieString) {
        sendDataToServer("storage", {"top_level_url": window.location.href, "function": "cookieSetter", "cookie": cookieString, "stack": new Error().stack});
        // Ensuring normal functionality
        return cookieSetter(cookieString);
    }
});

// Monitoring access to local and session storage to get any information as key
// Storing the original function prototype of getItem for usage under error or to perform normal functionality
let getStorageFunction = window.Storage.prototype.getItem;
// Overriding getItem
window.Storage.prototype.getItem = function(keyName) {
    let value = getStorageFunction.apply(this, arguments);
    sendDataToServer("storage", {"top_level_url": window.location.href, "function": "storageGetter", "storage": {keyName}, "stack": new Error().stack});
    // Ensuring normal functionality
    return value;
}

// Monitoring access to local and session storage to set any information as key, value pair
// Storing the original function prototype of setItem for usage under error or to perform normal functionality
let setStorageFunction = window.Storage.prototype.setItem;
// Overriding setItem
window.Storage.prototype.setItem = function(keyName, keyValue) {
    setStorageFunction.apply(this, arguments);
    sendDataToServer("storage", {"top_level_url": window.location.href, "function": "storageSetter", "storage": {"keyName": keyName, "keyValue": keyValue}, "stack": new Error().stack});
    // Ensuring normal functionality
    return;
}


// ********************** EVENT APIs **********************

// Monitoring addition of EventListener()'s
// Storing the original function prototype of addEventListener for usage under error or to perform normal functionality
var addEventListnerPrototype = EventTarget.prototype.addEventListener;
// Overriding addEventListener
EventTarget.prototype.addEventListener = function(type, func, capture) {
    addEventListnerPrototype.apply(this, arguments)
    sendDataToServer("eventSet", {"top_level_url": window.location.href, "function": "addEventListener", "event": func, "type": type, "capture": capture, "this": JSON.stringify(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return;
}

// Monitoring removal of EventListener()'s
// Storing the original function prototype of removeEventListener for usage under error or to perform normal functionality
var removeEventListenerPrototype = EventTarget.prototype.removeEventListener;
// Overriding removeEventListener
EventTarget.prototype.removeEventListener = function(type, func, capture) {
    removeEventListenerPrototype.apply(this, arguments)
    sendDataToServer("eventSet", {"top_level_url": window.location.href, "function": "removeEventListener", "event": func, "type": type, "capture": capture, "this": String(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return;
}

// Monitoring setting/adding of attribute
// Storing the original function prototype of setAttribute for usage under error or to perform normal functionality
var setAttributePrototype = Element.prototype.setAttribute;
// Overriding setAttribute
Element.prototype.setAttribute = function(name, value) {
    setAttributePrototype.apply(this, arguments)
    sendDataToServer("eventSet", {"top_level_url": window.location.href, "function": "setAttribute", "event": "setAttribute", "name": name, "value": value, "this": String(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return;
}

// Monitoring getting of attribute
// Storing the original function prototype of getAttribute for usage under error or to perform normal functionality
var getAttributePrototype = Element.prototype.getAttribute;
// Overriding getAttribute
Element.prototype.getAttribute = function(name) {
    let value = getAttributePrototype.apply(this, arguments)
    sendDataToServer("eventGet", {"top_level_url": window.location.href, "function": "getAttribute", "event": "getAttribute", "name": name, "value": value, "this": String(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return value;
}

// Monitoring removal of attribute
// Storing the original function prototype of removeAttribute for usage under error or to perform normal functionality
var removeAttributePrototype = Element.prototype.removeAttribute;
// Overriding removeAttribute
Element.prototype.removeAttribute = function(name) {
    removeAttributePrototype.apply(this, arguments)
    sendDataToServer("eventSet", {"top_level_url": window.location.href, "function": "removeAttribute", "event": "removeAttribute", "name": name, "this": String(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return;
}


// ********************** ELEMENT APIs **********************

// Monitoring createElement
// Storing the original document.createElement function
var originalCreateElement = document.createElement.bind(document);
// Overriding document.createElement
document.createElement = function(tagName, options) {
    sendDataToServer("element", {"top_level_url": window.location.href, "function": "createElement", "tagName": tagName, "options": JSON.stringify(options), "this": String(this), "stack": new Error().stack});
    // Ensuring normal functionality
    return originalCreateElement(tagName, options);
};

// Monitoring HTMLImageElement
// Storing the original HTMLImageElement prototype
const originalImagePrototype = HTMLImageElement.prototype;
const imgHandler = {
    get(target, property, receiver) {
        // Maintaining the default behaviour using Reflect.get and getting the actual property value
        const value = Reflect.get(...arguments);
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "getHTMLImageElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return value;
    },
    set(target, property, value, receiver) {
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "setHTMLImageElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return Reflect.set(...arguments);
    }
};
// Creating a proxy around the HTMLImageElement prototype
HTMLImageElement.prototype = new Proxy(originalImagePrototype, imgHandler);

// Monitoring HTMLScriptElement
// Storing the original HTMLScriptElement prototype
const originalScriptPrototype = HTMLScriptElement.prototype;
const scriptHandler = {
    get(target, property, receiver) {
        // Maintaining the default behaviour using Reflect.get and getting the actual property value
        const value = Reflect.get(...arguments);
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "getHTMLScriptElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return value;
    },
    set(target, property, value, receiver) {
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "setHTMLScriptElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return Reflect.set(...arguments);
    }
};
// Creating a proxy around the HTMLScriptElement prototype
HTMLScriptElement.prototype = new Proxy(originalScriptPrototype, scriptHandler);

// Monitoring HTMLIFrameElement
// Storing the original HTMLIFrameElement prototype
const originalIFramePrototype = HTMLIFrameElement.prototype;
const iframeHandler = {
    get(target, property, receiver) {
        // Maintaining the default behaviour using Reflect.get and getting the actual property value
        const value = Reflect.get(...arguments);
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "getHTMLIFrameElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return value;
    },
    set(target, property, value, receiver) {
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "setHTMLIFrameElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return Reflect.set(...arguments);
    }
};
// Creating a proxy around the HTMLIFrameElement prototype
HTMLIFrameElement.prototype = new Proxy(originalIFramePrototype, iframeHandler);

// Monitoring HTMLCanvasElement
// Storing the original HTMLCanvasElement prototype
const originalCanvasPrototype = HTMLCanvasElement.prototype;
const canvasHandler = {
    get(target, property, receiver) {
        // Maintaining the default behaviour using Reflect.get and getting the actual property value
        const value = Reflect.get(...arguments);
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "getHTMLCanvasElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return value;
    },
    set(target, property, value, receiver) {
        sendDataToServer("element", {"top_level_url": window.location.href, "function": "setHTMLCanvasElement", "property": property, "propertyValue": value, "stack": new Error().stack});
        // Ensuring normal functionality
        return Reflect.set(...arguments);
    }
};
// Creating a proxy around the HTMLCanvasElement prototype
HTMLCanvasElement.prototype = new Proxy(originalCanvasPrototype, canvasHandler);


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
        sendDataToServer("property", {"top_level_url": window.location.href, "function": "window.nameGetter", "name": storedName, "stack": new Error().stack});
        // Ensuring normal functionality
        return nameGetter();
    },
    // overriding setting window.name
    set: function(nameValue) {
        sendDataToServer("property", {"top_level_url": window.location.href, "function": "window.nameSetter", "name": nameValue, "stack": new Error().stack});
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
        sendDataToServer("property", {"top_level_url": window.location.href, "function": "document.referrerGetter", "referrer": originalReferrer, "stack": new Error().stack});
        // Ensuring normal functionality
        return originalReferrer;
    },
    set: function(newValue) {
        sendDataToServer("property", {"top_level_url": window.location.href, "function": "document.referrerSetter", "referrer": newValue, "stack": new Error().stack});
        // Ensuring normal functionality
        // Since referrer is read only property
        // originalReferrer = newValue;
    },
    configurable: true
});

// Monitoring window.screen
// Extracting a reference to the original screen object
const originalScreen = window.screen;
// Creating a proxy object to override screen properties
const screenProxy = new Proxy(originalScreen, {
    get(target, property) {
        sendDataToServer("property", {"top_level_url": window.location.href, "function": "window.screenGetter", "property": property, "propertyValue": target[property], "stack": new Error().stack});
        // Ensuring the normal functionality
        return target[property];
    }
});
// Overriding window.screen with the proxy object
Object.defineProperty(window, 'screen', {
    get: function() {return screenProxy;},
    configurable: true
});


// ********************** FINGERPRINTING APIs **********************

// Monitoring window.navigator
// Extracting a reference to the original navigator object
const originalNavigator = window.navigator;
// Creating a proxy object to override window.navigator properties
const navigatorProxy = new Proxy(originalNavigator, {
    get(target, property) {
        sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": "window.navigatorGetter", "property": property, "propertyValue": target[property], "stack": new Error().stack});
        // Ensuring the normal functionality
        return target[property];
    }
});
// Overriding window.navigator with the proxy object
Object.defineProperty(window, 'navigator', {
    get: function() {return navigatorProxy;},
    set: function(newValue) {
        sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": "window.navigatorSetter", "newValue": JSON.stringify(newValue), "stack": new Error().stack});
        // Overriding the overrided navigator or not
        // window.navigator = originalNavigator; // Keeping the original navigator
    },
    configurable: true
});

// Monitoring the below listed web audio and WebRTC APIs
const monitoredClasses = [
    ScriptProcessorNode,
    GainNode,
    AnalyserNode,
    OscillatorNode,
    OfflineAudioContext,
    AudioContext,
    RTCPeerConnection
];

monitoredClasses.forEach((OriginalClass) => {
    window[OriginalClass.name] = new Proxy(OriginalClass, {
        construct(target, args) {
            sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": OriginalClass.name, "type": "apiInstantiation", "arguments": args, "timestamp": new Date().toISOString(), "stack": new Error().stack});
            // Retaining other arguments for OriginalClass and returning overriden object with get and set updated as below
            const instance = new target(...args);
            // Return a proxy to wrap the instance for future access monitoring
            return new Proxy(instance, {
                get(target, prop, receiver) {
                    const originalProperty = Reflect.get(target, prop, receiver);
                    sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": OriginalClass.name, "type": "get", "property": prop, "timestamp": new Date().toISOString(), "stack": new Error().stack});
                    if (typeof originalProperty === 'function') {
                        return function(...args) {
                            return originalProperty.apply(target, args);
                        };
                    }
                    return originalProperty;
                },
                set(target, prop, value, receiver) {
                    sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": OriginalClass.name, "type": "set", "value": value, "timestamp": new Date().toISOString(), "stack": new Error().stack});
                    return Reflect.set(target, prop, value, receiver);
                }
            });
        }
    });
});

// Monitoring CanvasRenderingContext2D
// CanvasRenderingContext2D properties to exclude
const excludedProperties = [
    "quadraticCurveTo",
    "lineTo",
    "transform",
    "globalAlpha",
    "moveTo",
    "drawImage",
    "setTransform",
    "clearRect",
    "closePath",
    "beginPath",
    "canvas",
    "translate"
];

// Storing the original function prototype of CanvasRenderingContext2D for usage under error or to perform normal functionality
const contextPrototype = CanvasRenderingContext2D.prototype;
// Creating a proxy handler
const handler = {
    get(target, prop, receiver) {
        // Checking if the property is excluded
        if (excludedProperties.includes(prop)) {
            return Reflect.get(target, prop, receiver);
        }
        // Ensuring the normal functionality
        const originalValue = Reflect.get(target, prop, receiver);
        // If the property is a function, wrap it
        if (typeof originalValue === 'function') {
            return function(...args) {
                sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": "CanvasRenderingContext2D", "method": prop, "arguments": args, "timestamp": new Date().toISOString(), "stack": new Error().stack});
                // Ensuring the normal functionality
                return originalValue.apply(this, args);
            };
        } else {
            // Sending non-function property access details to the server
            sendDataToServer("fingerprinting", {"top_level_url": window.location.href, "function": "CanvasRenderingContext2D", "property": "CanvasRenderingContext2D", "name": prop, "value": originalValue, "timestamp": new Date().toISOString(), "stack": new Error().stack});
            return originalValue;
        }
    }
};
// Overriding the prototype of CanvasRenderingContext2D with the proxy object
CanvasRenderingContext2D.prototype = new Proxy(contextPrototype, handler);


// ********************** NETWORK APIs **********************

// Monitoring sendBeacon
// Storing the original function prototype of sendBeacon for usage under error or to perform normal functionality
var sendBeaconPrototype = Navigator.prototype.sendBeacon;
// Overriding sendBeacon
Navigator.prototype.sendBeacon = function(url, data) {
    sendBeaconPrototype.apply(this, arguments)
    sendDataToServer("request", {"top_level_url": window.location.href, "function": "sendBeacon", "property": "CanvasRenderingContext2D", "url": url, "this": String(this), "stack": new Error().stack});
    return;
}