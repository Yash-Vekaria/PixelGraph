// content script
function injectJSWithDomain(domain) {
    var headElement = document.head || document.documentElement;
    var scriptId = 'pixelGraphScript';
    if (document.getElementById(scriptId)) {
        console.log('Skipping Script Injection: inject.js is already injected!');
        return;
    }

    var scriptElement = document.createElement('script');
    scriptElement.id = scriptId;
    fetch(chrome.runtime.getURL('scripts/inject.js'))
        .then(response => response.text())
        .then(code => {
            scriptElement.textContent = `window.currentCrawlDomain = ${JSON.stringify(domain)};\n${code}`;
            headElement.insertBefore(scriptElement, headElement.firstElementChild);
        })
        .catch(error => console.error('Error loading inject.js:', error));
}

// Listening to messages from the background script to inject inject.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'crawlDomain') {
        console.log('Domain received:', message.domain);
        injectJSWithDomain(message.domain);
    }
});

// Listening to messages from the injected script to send it to background script
window.addEventListener('message', function(event) {
    console.log(event.source, event.data)
    if (event.source == window && event.data && event.data.type === 'interceptionFromInjectedJS') {
        chrome.runtime.sendMessage(event.data.message, function(response) {
            console.log('Response from background script:', response);
        });
    }
});