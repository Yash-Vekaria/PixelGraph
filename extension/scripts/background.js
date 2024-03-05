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


function onEvent(debuggeeId, message, params) {
    if (tabId != debuggeeId.tabId)
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
                console.log("Request complete! response");
            });
        }
    } else if (message == "Network.requestWillBeSentExtraInfo") {
        fetch(`http://localhost:${port}/requestinfo`, {
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
            console.log("RequestInfo complete! response");
        });

    } 
    else if (message == "Network.responseReceived") {
        chrome.debugger.sendCommand({
            tabId: tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            // you get the response body here!
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
                console.log("Response complete! response");
            });
        });
    }

    if (message == "Debugger.scriptParsed") {
        fetch(`http://localhost:${port}/scriptid`, {
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
            console.log("scriptids complete! response");
        });

        const url = chrome.extension.getURL('breakpoint.json');
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                for (let i = 0; i < json.length; i++) {
                    if (json[i].url == params.url) {
                        chrome.debugger.sendCommand({
                            tabId: debuggeeId.tabId
                        }, 'Debugger.setBreakpointByUrl', json[i], (resp) => {
                            if (chrome.runtime.lastError) {
                                console.log(json[i])
                                console.log(chrome.runtime.lastError.message);
                            }
                        })
                    }
                }
            });
    }

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
                tabId: debuggeeId.tabId
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