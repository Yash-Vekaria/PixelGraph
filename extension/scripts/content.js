// Injecting inject.js as the first node in the head of each frame with same origin
var headElement = (document.head || document.documentElement);
var injectJS = function(fileName) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(fileName);
    headElement.insertBefore(s, headElement.firstElementChild);
};
injectJS("inject.js");