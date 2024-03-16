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

// Sending intercepted data to background script as direct fetch() can cause CSP violation errors in iframes
function sendMessageToBackground(path, data) {
    // const serializableData = serializeData(data);
    // Using window.postMessage to send data via the content script (bridge) as background scripts are not accessible in context of injected script
    console.log(data.website)
    console.log(data)
    window.postMessage({
        type: 'interceptionFromInjectedJS',
        message: {
            path: path,
            data: data
        }
    }, "*"); // Setting target origin to *
}


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