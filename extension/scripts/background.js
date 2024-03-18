window.tabId = -1;
window.website = '';
const port = 8000;
const batchBuffer = {};
const batchSizeLimit = {'request': 10, 'requestInfo': 5, 'response': 10, 'storage': 5, 'eventSet': 5, 'eventGet': 5, 'script': 5, 'element': 5, 'property': 5, 'fingerprinting': 2};
const paths = ['request', 'requestInfo', 'response', 'storage', 'eventSet', 'eventGet', 'script', 'element', 'property', 'fingerprinting'];

// Initialize batch buffer for each endpoint
function initBatchBuffer(paths) {
    paths.forEach(path => {
        batchBuffer[path] = [];
    });
}
initBatchBuffer(paths);


// Sending data to my localhost server in batches
function flushBatchBuffer() {
    const promises = [];
    for (const path in batchBuffer) {
        const dataBatch = batchBuffer[path];
        console.log("Flushing", dataBatch.length, dataBatch);
        if (dataBatch.length === 0) continue;
        const promise = fetch(`http://localhost:${port}/${path}`, {
            method: "POST",
            body: JSON.stringify(dataBatch),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        });
        promises.push(promise);
        batchBuffer[path] = [];
    }
    return Promise.all(promises);
}

// Collect data to send in batch
function sendDataToMyServer(path, data) {
    if (!batchBuffer[path]) {
        batchBuffer[path] = [];
    }
    batchBuffer[path].push(data);
    console.log("Batching", data);
    if (batchBuffer[path].length >= batchSizeLimit[path]) {
        return flushBatchBuffer();
    }
    return Promise.resolve('Added to batch');
}

// Listening to messages from content script for receiving the intercepted data from injected script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message.data)
    sendDataToMyServer(message.path, message.data)
        .then(() => {
            sendResponse({ 
                success: true 
            });
        })
        .catch(error => {
            console.error('Error sending data to server:', error);
            sendResponse({ 
                success: false, 
                error: error.toString() 
            });
        });
    return true;  // To sendResponse asynchronously
});

/*
// Sending data from to my localhost server
function sendDataToMyServer(path, data) {
    return new Promise((resolve, reject) => {
        console.log(data);
        fetch(`http://localhost:${port}/${path}`, {
            method: "POST",
            body: JSON.stringify(data),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        })
        .then(res => {
            if (res.ok) {
                console.log(`${data.function} data sent to server.`);
                resolve(res);
            } else {
                throw new Error(`Server responded with status: ${res.status}`);
            }
        })
        .catch(err => {
            console.error(`Error in sending ${data.function}:`, err);
            reject(err);
        });
    });
}
*/


// Listening for and capturing Network events
function onEvent(debugId, message, params) {
    if (tabId != debugId.tabId)
        return;
    /*
    if (message == "Network.requestWillBeSent") {
        if (!params.request.url.includes('localhost')) {
            sendDataToMyServer("request", {
                "function": "Network.requestWillBeSent",
                "website": window.website,
                "http_req": params.request.url,
                "request_id": params.requestId,
                "top_level_url": 0,
                "frame_url": params.documentURL,
                "resource_type": params.type,
                "header": params.request.headers,
                "timestamp": params.timestamp,
                "frameId": params.frameId,
                "call_stack": params.initiator
            });
        }
    } else if (message == "Network.requestWillBeSentExtraInfo") {
        sendDataToMyServer("requestInfo", {
            "function": "Network.requestWillBeSentExtraInfo",
            "website": window.website,
            "request_id": params.requestId,
            "cookies": params.associatedCookies,
            "headers": params.headers,
            "connectTiming": params.connectTiming,
            "clientSecurityState": params.clientSecurityState
        });
    }
    else if (message == "Network.responseReceived") {
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            sendDataToMyServer("response", {
                "function": "Network.responseReceived",
                "website": window.website,
                "request_id": params.requestId,
                "response": params.response,
                "resource_type": params.type
            });
        });
    }
    // Capturing execution of any script
    if (message == "Debugger.scriptParsed") {
        sendDataToMyServer("script", {
            "function": "Network.responseReceived",
            "website": window.website,
            "scriptId": params.scriptId,
            "url": params.url
        });
    }
    */
}

// Entering debugging mode for the active tab
function attachDebuggerToTab(tabId) {
    chrome.debugger.attach({ 
        tabId: tabId 
    }, 
    "1.0", 
    function() {
        if (chrome.runtime.lastError) {
            console.log("Debugger attach failed: ", chrome.runtime.lastError.message);
            // console.error("Debugger attach failed: ", chrome.runtime.lastError.message);
        } else {
            console.log("Debugger attached.");
            chrome.debugger.sendCommand({ tabId: tabId }, "Network.enable");
            chrome.debugger.sendCommand({ tabId: tabId }, "Debugger.enable");
            chrome.debugger.onEvent.addListener(onEvent);
        }
    });
}

// Activating debugger on the newly active tab
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (!tab.url.startsWith('chrome://')) {
            window.tabId = tab.id;
            window.website = new URL(tab.url).hostname;
            console.log(window.tabId, window.website);
            attachDebuggerToTab(tab.id);
        }
    });
});

// Updating debugger attachment for updated tabs (e.g., navigating to a new URL)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active && !tab.url.startsWith('chrome://')) {
        window.tabId = tabId;
        window.website = new URL(tab.url).hostname;
        console.log(window.tabId, window.website);
        chrome.tabs.sendMessage(tabId, {
            type: 'crawlDomain', 
            domain: window.website
        });
        attachDebuggerToTab(tabId);
    }
});

// Inject JS inside an iframe at OnBeforeNavigated stage of its loading
function injectInsideIframes(iframe) {
    window.tabId = iframe.tabId;
    window.frameId = iframe.frameId;
    
    chrome.tabs.get(window.tabId, function(tab) {
        window.website = new URL(tab.url).hostname;

        setTimeout(() => {
            chrome.tabs.executeScript(
                window.tabId, { 
                    frameId: window.frameId, 
                    file: "scripts/content.js", 
                    matchAboutBlank: true 
                },
                function(result) {
                    console.log(`Tab ID: ${window.tabId} | Frame ID: ${window.frameId} | Website: ${window.website}`);
                    chrome.tabs.sendMessage(window.tabId, {
                        type: 'crawlDomain', 
                        domain: window.website
                    });
                }
            );
        }, 5);
    });
}

// Injecting inject.js inside each iframe
// OnBeforeNavigated Event is fired just before iframe navigations related to its loading starts
chrome.webNavigation.onBeforeNavigate.addListener(injectInsideIframes);

// Listen for clicks on the extension icon to display the message
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(`Extension icon clicked on Tab: ${tab.id}`);
});