window.tabId = 0;
const port = 8000;

// Sending data from to my localhost server
function sendDataToMyServer(path, data) {
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

// Listening for and capturing Network events
function onEvent(debugId, message, params) {
    if (tabId != debugId.tabId)
        return;
    if (message == "Network.requestWillBeSent") {
        if (!params.request.url.includes('localhost')) {
            sendDataToMyServer("request", {
                "function": "Network.requestWillBeSent",
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
        sendDataToMyServer("request", {
            "function": "Network.requestWillBeSentExtraInfo",
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
            "scriptId": params.scriptId,
            "url": params.url
        });
    }
}

// Entering debugging mode for the active tab
chrome.tabs.query({
        active: true
    },
    function(d) {
        window.tabId = d[0].id;
        chrome.debugger.attach({
                tabId: tabId
            }, "1.0",
            function(err) {
                if (err)
                    console.log(err);
                else
                    console.log("Debugger attached.");
            });
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.enable");
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Debugger.enable");
        chrome.debugger.onEvent.addListener(onEvent);
    }
)

// Listen for clicks on the extension icon to display the message
chrome.browserAction.onClicked.addListener(function(tab) {
    console.log(`Extension icon clicked on Tab: ${tab.id}`);
});