window.tabId = 0;
const port = 8000;

// Function to return header strings by concatinating individual headers
function getHeaderString(headers) {
    let responseHeaderString = '';
    headers.forEach((header, key) => {
        responseHeaderString += key + ':' + header + '\n';
    });
    return responseHeaderString;
}

// Function to perform XHR request to the input URL based on the other parameters
async function xhrSend(url, headers, method, postData, success, error) {
    let finalResponse = {};
    let response = await fetch(url, {
        method,
        mode: 'cors',
        headers,
        redirect: 'follow',
        body: postData
    });
    finalResponse.response = await response.text();
    finalResponse.headers = getHeaderString(response.headers);
    if (response.ok) {
        success(finalResponse);
    } else {
        error(finalResponse);
    }
}

// Listening for and capturing Network events
function onEvent(debugId, message, params) {
    if (tabId != debugId.tabId)
        return;
    if (message == "Network.requestWillBeSent") {
        if (!params.request.url.includes('localhost')) {
            fetch(`http://localhost:${port}/request`, {
                method: "POST",
                body: JSON.stringify({
                    "http_req": params.request.url,
                    "request_id": params.requestId,
                    "top_level_url": 0,
                    "frame_url": params.documentURL,
                    "resource_type": params.type,
                    "header": params.request.headers,
                    "timestamp": params.timestamp,
                    "frameId": params.frameId,
                    "call_stack": params.initiator
                }),
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Content-Type": "application/json"
                }
            }).then(res => {
                console.log("request data collected.");
            });
        }
    } else if (message == "Network.requestWillBeSentExtraInfo") {
        fetch(`http://localhost:${port}/requestInfo`, {
            method: "POST",
            body: JSON.stringify({
                "request_id": params.requestId,
                "cookies": params.associatedCookies,
                "headers": params.headers,
                "connectTiming": params.connectTiming,
                "clientSecurityState": params.clientSecurityState
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("requestInfo data collected.");
        });
    } 
    else if (message == "Network.responseReceived") {
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            fetch(`http://localhost:${port}/response`, {
                method: "POST",
                body: JSON.stringify({
                    "request_id": params.requestId,
                    "response": params.response,
                    "resource_type": params.type
                }),
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Content-Type": "application/json"
                }
            }).then(res => {
                console.log("response data collected.");
            });
        });
    }
    // Capturing execution of any script
    if (message == "Debugger.scriptParsed") {
        fetch(`http://localhost:${port}/scriptId`, {
            method: "POST",
            body: JSON.stringify({
                "scriptId": params.scriptId,
                "url": params.url
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log("scriptId data collected.");
        });
    }
    // Handling to resume the debugger in case of set breakpoints or error
    if (message == "Debugger.paused") {
        fetch(`http://localhost:${port}/debug`, {
            method: "POST",
            body: JSON.stringify({
                "reason": params.reason,
                "heap": params.callFrames,
                "data": params.data,
                "stack": params.asyncStackTrace,
                "hitBreakpoints": params.hitBreakpoints
            }),
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Content-Type": "application/json"
            }
        }).then(res => {
            chrome.debugger.sendCommand({
                tabId: debugId.tabId
            }, 'Debugger.resume');
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