// A robust serializer function to handle circular references and cross-origin objects safely
function customSerializer(maxDepth) {
    const seen = new WeakSet();
    
    function serialize(key, value, depth = 0) {
        if (depth > maxDepth) {
            return '[Max Depth Exceeded]';
        }
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
            if (value instanceof Window) {
                return '[Window object]';
            } else if (value instanceof Element) {
                return {
                    tag: value.tagName,
                    id: value.id,
                    className: value.className
                };
            } else if (value instanceof Node) {
                return `[Node: ${value.nodeName}]`;
            } else {
                const obj = {};
                for (const property in value) {
                    if (Object.hasOwnProperty.call(value, property)) {
                        obj[property] = serialize(property, value[property], depth + 1);
                    }
                }
                seen.delete(value);
                return obj;
            }
        } else if (typeof value === 'function') {
            return `[Function: ${value.name || 'anonymous'}]`;
        } else {
            return value;
        }
    }

    return function(key, value) {
        return serialize(key, value);
    };
}

// Hashing function for string data
function hashString(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        // Converting to 32-bit integer
        hash |= 0;
    }
    return hash;
}

// Setting to store hashes of already sent data
window.sentDataHashes = window.sentDataHashes || new Set();
// Sending intercepted data to background script as direct fetch() can cause CSP violation errors in iframes
function sendMessageToBackground(path, data) {
    // const serializableData = serializeData(data);
    const stringifiedData = JSON.stringify(data);
    const dataHash = hashString(stringifiedData);
    if (window.sentDataHashes.has(dataHash)) {
        console.log('Data already sent:', data);
        return;
    }
    // Using window.postMessage to send data via the content script (bridge) as background scripts are not accessible in context of injected script
    console.log(data.website, data)
    window.postMessage({
        type: 'interceptionFromInjectedJS',
        message: {
            path: path,
            data: data
        }
    }, "*"); // Setting target origin to *
    // Storing hash of the data sent
    sentDataHashes.add(dataHash);
}

/*
// ********************** NETWORK APIs **********************

// Monitoring sendBeacon
// Storing the original function prototype of sendBeacon for usage under error or to perform normal functionality
var sendBeaconPrototype = Navigator.prototype.sendBeacon;
// Overriding sendBeacon
Navigator.prototype.sendBeacon = function(url, data) {
    let thisStr;
    try {
        thisStr = JSON.stringify(this, customSerializer(3));
    } catch (error) {
        thisStr = "SerializationFailed";
    }
    sendMessageToBackground("request", {
        "function": "sendBeacon",
        "website": window.currentCrawlDomain,
        "http_req": url,
        "request_id": "",
        "top_level_url": window.location.href,
        "frame_url": "",
        "resource_type": "",
        "header": "",
        "timestamp": "",
        "frameId": "",
        "call_stack": new Error().stack,
        "data": data,
        "this": String(this), 
        "serialized_this": thisStr,
    });
    sendBeaconPrototype.apply(this, arguments);
};


// ********************** STORAGE APIs **********************

// Checking if cookieGetter and cookieSetter have already been defined to avoid TypeError
if (typeof window.cookieGetter === 'undefined' || typeof window.cookieSetter === 'undefined') {
    // Extracting the original functions responsible for getting and setting cookies using document.cookie by binding .this to document
    // These enable normal functioning of the page in case of errors in overridden logic or to perform normal functionality
    window.cookieGetter = document.__lookupGetter__("cookie").bind(document);
    window.cookieSetter = document.__lookupSetter__("cookie").bind(document);
}
// Checking whether the cookie property can be redefined or not
var canDefineProperty = true;
try {
    var descriptor = Object.getOwnPropertyDescriptor(document, 'cookie');
    if (descriptor && !descriptor.configurable) {
        canDefineProperty = false;
    }
} catch (e) {
    console.log('Error while checking property descriptor of document.cookie: ', e);
}
if (canDefineProperty) {
    // Overriding document.cookie
    Object.defineProperty(document, 'cookie', {
        get: function() {
            var storedCookieStr = cookieGetter();
            sendMessageToBackground("storage", {
                "top_level_url": window.location.href,
                "website": window.currentCrawlDomain,
                "function": "cookieGetter", 
                "cookie": storedCookieStr, 
                "stack": new Error().stack
            });
            return cookieGetter();
        },
        set: function(cookieString) {
            sendMessageToBackground("storage", {
                "top_level_url": window.location.href,
                "website": window.currentCrawlDomain,
                "function": "cookieSetter", 
                "cookie": cookieString, 
                "stack": new Error().stack
            });
            return cookieSetter(cookieString);
        },
        configurable: true
    });
}

// Monitoring access to local and session storage to get and set of any information
// Ensuring that the original function prototypes are stored only once
if (typeof window.getStorageFunction === 'undefined') {
    window.getStorageFunction = window.Storage.prototype.getItem;
}
if (typeof window.setStorageFunction === 'undefined') {
    window.setStorageFunction = window.Storage.prototype.setItem;
}
// Overriding Storage.getItem
window.Storage.prototype.getItem = function(keyName) {
    let value = window.getStorageFunction.apply(this, arguments);
    sendMessageToBackground("storage", {
        "top_level_url": window.location.href,
        "website": window.currentCrawlDomain, 
        "function": "storageGetter", 
        "storage": {keyName}, 
        "stack": new Error().stack
    });
    return value;
}

// Overriding Storage.setItem
window.Storage.prototype.setItem = function(keyName, keyValue) {
    window.setStorageFunction.apply(this, arguments);
    sendMessageToBackground("storage", {
        "top_level_url": window.location.href,
        "website": window.currentCrawlDomain,
        "function": "storageSetter", 
        "storage": {
            "keyName": keyName, 
            "keyValue": keyValue}, 
        "stack": new Error().stack
    });
    return;
}


// ********************** PROPERTY APIs **********************

// Monitoring window.name
// Ensuring the variables are not redeclared if the script is injected multiple times
window.originalNameVars = window.originalNameVars || {};
var vars = window.originalNameVars;
// Extracting the original functions responsible for getting and setting window.name
if (!vars.nameGetter || !vars.nameSetter) {
    vars.nameGetter = window.__lookupGetter__("name").bind(window);
    vars.nameSetter = window.__lookupSetter__("name").bind(window);
}
// Overriding access to window.name
Object.defineProperty(window, 'name', {
    get: function() {
        if (this.isGetting) {
            return vars.nameGetter();
        }
        this.isGetting = true;
        var storedName = vars.nameGetter();
        sendMessageToBackground("property", {
            "top_level_url": window.location.href,
            "website": window.currentCrawlDomain,
            "function": "window.nameGetter", 
            "name": storedName, 
            "stack": new Error().stack
        });
        this.isGetting = false;
        return storedName;
    },
    set: function(nameValue) {
        if (this.isSetting) {
            return vars.nameSetter(nameValue);
        }
        this.isSetting = true;
        sendMessageToBackground("property", {
            "top_level_url": window.location.href,
            "website": window.currentCrawlDomain,
            "function": "window.nameSetter", 
            "name": nameValue, 
            "stack": new Error().stack
        });
        vars.nameSetter(nameValue);
        this.isSetting = false;
    }
});

// Monitoring document.referrer
// Extracting the original document.referrer value
if (typeof originalReferrer === 'undefined') {
    var originalReferrer = document.referrer;
}
// Overriding document.referrer
Object.defineProperty(document, 'referrer', {
    get: function() {
        sendMessageToBackground("property", {
            "top_level_url": window.location.href,
            "website": window.currentCrawlDomain,
            "function": "document.referrerGetter", 
            "referrer": originalReferrer, 
            "stack": new Error().stack
        });
        return originalReferrer;
    },
    set: function(newValue) {
        sendMessageToBackground("property", {
            "top_level_url": window.location.href,
            "website": window.currentCrawlDomain,
            "function": "document.referrerSetter", 
            "referrer": newValue, 
            "stack": new Error().stack
        });
        // originalReferrer = newValue; // Commented since referrer is read only property
    },
    configurable: true
});

// Monitoring window.screen
// Extracting a reference to the original screen object
if (typeof originalScreen === 'undefined') {
    var originalScreen = window.screen;
}
// Declaring the screenProxy outside of the if block to increase its scope
var screenProxy;
if (typeof window.screenProxy === 'undefined') {
    // Creating a proxy object to override screen properties
    window.screenProxy = new Proxy(originalScreen, {
        get(target, property) {
            sendMessageToBackground("property", {
                "top_level_url": window.location.href,
                "website": window.currentCrawlDomain,
                "function": "window.screenGetter", 
                "property": property, 
                "propertyValue": target[property], 
                "stack": new Error().stack
            });
            return target[property];
        }
    });
    screenProxy = window.screenProxy;
}
// Overriding window.screen with the proxy object
Object.defineProperty(window, 'screen', {
    get: function() {
        return screenProxy;
    },
    configurable: true
});


// ********************** FINGERPRINTING APIs **********************

// Monitoring window.navigator
// Extracting a reference to the original navigator object
if (typeof originalNavigator === 'undefined') {
    var originalNavigator = window.navigator;
}
// Declaring the navigatorProxy outside of the if block to increase its scope
var navigatorProxy;
if (typeof window.navigatorProxy === 'undefined') {
    window.navigatorProxy = new Proxy(originalNavigator, {
        get(target, property) {
            // Send message to background script with information about the property accessed
            sendMessageToBackground("fingerprinting", {
                "top_level_url": window.location.href,
                "website": window.currentCrawlDomain,
                "function": "window.navigatorGetter", 
                "property": property, 
                "propertyValue": target[property], 
                "stack": new Error().stack
            });
            return target[property];
        }
    });
    // Assign navigatorProxy to the proxy created
    navigatorProxy = window.navigatorProxy;
}
// Overriding window.navigator with the proxy object
Object.defineProperty(window, 'navigator', {
    get: function() {
        return navigatorProxy;
    },
    set: function(newValue) {
        sendMessageToBackground("fingerprinting", {
            "top_level_url": window.location.href,
            "website": window.currentCrawlDomain,
            "function": "window.navigatorSetter", 
            "newValue": JSON.stringify(newValue), 
            "stack": new Error().stack
        });
        // Overriding the overrided navigator or not
        // window.navigator = originalNavigator; // Keeping the original navigator
    },
    configurable: true
});

// Monitoring the below listed web audio and WebRTC APIs
if (typeof window.monitoredClasses === 'undefined') {
    window.monitoredClasses = [
        'ScriptProcessorNode',
        'GainNode',
        'AnalyserNode',
        'OscillatorNode',
        'OfflineAudioContext',
        'AudioContext',
        'RTCPeerConnection'
    ];

    window.monitoredClasses.forEach((className) => {
        // Check if the class exists in the global scope
        if (typeof window[className] === 'function') {
            const OriginalClass = window[className];
            window[className] = new Proxy(OriginalClass, {
                construct(target, args) {
                    sendMessageToBackground("fingerprinting", {
                        "top_level_url": window.location.href,
                        "website": window.currentCrawlDomain,
                        "function": className, 
                        "type": "apiInstantiation", 
                        "arguments": args, 
                        "timestamp": new Date().toISOString(), 
                        "stack": new Error().stack
                    });
                    const instance = new target(...args);
                    // Return a proxy to wrap the instance for future access monitoring
                    return new Proxy(instance, {
                        get(target, prop, receiver) {
                            const originalProperty = Reflect.get(target, prop, receiver);
                            sendMessageToBackground("fingerprinting", {
                                "top_level_url": window.location.href,
                                "website": window.currentCrawlDomain,
                                "function": className, 
                                "type": "get", 
                                "property": prop, 
                                "timestamp": new Date().toISOString(), 
                                "stack": new Error().stack
                            });
                            if (typeof originalProperty === 'function') {
                                return function(...args) {
                                    return originalProperty.apply(target, args);
                                };
                            }
                            return originalProperty;
                        },
                        set(target, prop, value, receiver) {
                            sendMessageToBackground("fingerprinting", {
                                "top_level_url": window.location.href,
                                "website": window.currentCrawlDomain,
                                "function": className, 
                                "type": "set", 
                                "value": value, 
                                "timestamp": new Date().toISOString(), 
                                "stack": new Error().stack
                            });
                            return Reflect.set(target, prop, value, receiver);
                        }
                    });
                }
            });
        };
    });
};

// Monitoring CanvasRenderingContext2D
// Check if the handler has already been applied to avoid redefining
if (typeof window.canvasContextProxyHandler === 'undefined') {
    // CanvasRenderingContext2D properties to exclude
    window.excludedProperties = [
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
    window.originalContextPrototype = CanvasRenderingContext2D.prototype;
    
    // Creating a proxy handler
    window.canvasContextProxyHandler = {
        get(target, prop, receiver) {
            if (window.excludedProperties.includes(prop)) {
                return Reflect.get(target, prop, receiver);
            }
            console.log(target, prop, receiver);
            const originalValue = Reflect.get(target, prop, receiver);
            // If the property is a function, wrap it
            if (typeof originalValue === 'function') {
                return function(...args) {
                    sendMessageToBackground("fingerprinting", {
                        "top_level_url": window.location.href,
                        "website": window.currentCrawlDomain,
                        "function": "CanvasRenderingContext2D", 
                        "method": prop, 
                        "arguments": args, 
                        "timestamp": new Date().toISOString(), 
                        "stack": new Error().stack
                    });
                    // Ensuring the normal functionality
                    return originalValue.apply(this, args);
                };
            } else {
                // Sending non-function property access details to the server
                sendMessageToBackground("fingerprinting", {
                    "top_level_url": window.location.href,
                    "website": window.currentCrawlDomain,
                    "function": "CanvasRenderingContext2D",
                    "name": prop, 
                    "value": originalValue, 
                    "timestamp": new Date().toISOString(), 
                    "stack": new Error().stack
                });
                return originalValue;
            }
        }
    };
    // Overriding the prototype of CanvasRenderingContext2D with the proxy object
    CanvasRenderingContext2D.prototype = new Proxy(window.originalContextPrototype, window.canvasContextProxyHandler);
};
*/