const port = 8000;

const express = require('express')
const app = express();
app.use(express.json({
    limit: '10000mb'
}));

const cors = require('cors');
app.use(cors({
    credentials: true,
    origin: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    limit: '10000mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '10000mb'
}));

const fs = require('fs');
const path = require('path');
const jsonfile = require('jsonfile');

// Saving received data

// Function to create directory if it doesn't exist
function createDirectory(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    createDirectory(dirname);
    fs.mkdirSync(dirname, {
        recursive: true
    });
}

async function saveRequest(receivedHTTPRequest, website) {
    const filename = '../output/' + website + '/request.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedHTTPRequest, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveRequestInfo(receivedHTTPRequest, website) {
    const filename = '../output/' + website + '/requestInfo.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedHTTPRequest, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveResponse(receivedHTTPResponse, website) {
    const filename = '../output/' + website + '/response.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedHTTPResponse, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveStorage(receivedStorageInfo, website) {
    const filename = '../output/' + website + '/storage.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedStorageInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveEventSet(receivedEventInfo, website) {
    const filename = '../output/' + website + '/eventSet.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedEventInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveEventGet(receivedEventInfo, website) {
    const filename = '../output/' + website + '/eventGet.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedEventInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveScript(receivedScriptInfo, website) {
    const filename = '../output/' + website + '/script.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedScriptInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveElement(receivedElementInfo, website) {
    const filename = '../output/' + website + '/element.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedElementInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveProperty(receivedPropertyInfo, website) {
    const filename = '../output/' + website + '/property.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedPropertyInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveFingerprinting(receivedFingerprintingInfo, website) {
    const filename = '../output/' + website + '/fingerprinting.json';
    createDirectory(filename);
    jsonfile.writeFile(filename, receivedFingerprintingInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}


// Listening for incoming requests

app.post('/request', (req, res) => {
    // saveRequestInfo(req.body, website);
    const requestData = req.body;
    if (Array.isArray(requestData)) {
        requestData.forEach(request => {
            website = request.website;
            console.log("[Request] Website:", website, request.top_level_url);
            saveRequest(request, website);
        });
    } else {
        console.error("Expected an array of request data");
    }
    res.send("request-success");
})

app.post('/requestInfo', (req, res) => {
    // saveRequestInfo(req.body, website);
    const requestInfoData = req.body;
    if (Array.isArray(requestInfoData)) {
        requestInfoData.forEach(requestInfo => {
            website = requestInfo.website;
            console.log("[RequestInfo] Website:", website, requestInfo.top_level_url);
            saveRequestInfo(requestInfo, website);
        });
    } else {
        console.error("Expected an array of requestInfo data");
    }
    res.send("requestInfo-success");
})

app.post('/response', (req, res) => {
    // saveResponse(req.body, website);
    const responseData = req.body;
    if (Array.isArray(responseData)) {
        responseData.forEach(response => {
            website = response.website;
            console.log("[Response] Website:", website, response.top_level_url);
            saveResponse(response, website);
        });
    } else {
        console.error("Expected an array of response data");
    }
    res.send("response-success");
})

app.post('/storage', (req, res) => {
    // saveStorage(req.body, website);
    const storageData = req.body;
    if (Array.isArray(storageData)) {
        storageData.forEach(storage => {
            website = storage.website;
            console.log("[Storage] Website:", website, storage.top_level_url);
            saveStorage(storage, website);
        });
    } else {
        console.error("Expected an array of storage data");
    }
    res.send("storage-success");
})

app.post('/eventSet', (req, res) => {
    // saveEventSet(req.body, website);
    const eventSetData = req.body;
    if (Array.isArray(eventSetData)) {
        eventSetData.forEach(eventSet => {
            website = eventSet.website;
            console.log("[EventSet] Website:", website, eventSet.top_level_url);
            saveEventSet(eventSet, website);
        });
    } else {
        console.error("Expected an array of eventSet data");
    }
    res.send("eventSet-success");
})

app.post('/eventGet', (req, res) => {
    // saveEventGet(req.body, website);
    const eventGetData = req.body;
    if (Array.isArray(eventGetData)) {
        eventGetData.forEach(eventGet => {
            website = eventGet.website;
            console.log("[EventGet] Website:", website, eventGet.top_level_url);
            saveEventGet(eventGet, website);
        });
    } else {
        console.error("Expected an array of eventGet data");
    }
    res.send("eventGet-success");
})

app.post('/script', (req, res) => {
    // saveScript(req.body, website);
    const scriptData = req.body;
    if (Array.isArray(scriptData)) {
        scriptData.forEach(script => {
            website = script.website;
            console.log("[Script] Website:", website, script.top_level_url);
            saveScript(script, website);
        });
    } else {
        console.error("Expected an array of script data");
    }
    res.send("script-success");
})

app.post('/element', (req, res) => {
    // saveElement(req.body, website);
    const elementData = req.body;
    if (Array.isArray(elementData)) {
        elementData.forEach(element => {
            website = element.website;
            console.log("[Element] Website:", website, element.top_level_url);
            saveElement(element, website);
        });
    } else {
        console.error("Expected an array of element data");
    }
    res.send("element-success");
})

app.post('/property', (req, res) => {
    // saveProperty(req.body, website);
    const propertyData = req.body;
    if (Array.isArray(propertyData)) {
        propertyData.forEach(property => {
            website = property.website;
            console.log("[Property] Website:", website, property.top_level_url);
            saveProperty(property, website);
        });
    } else {
        console.error("Expected an array of property data");
    }
    res.send("property-success");
})

app.post('/fingerprinting', (req, res) => {
    // saveFingerprinting(req.body, website);
    const fingerprintingData = req.body;
    if (Array.isArray(fingerprintingData)) {
        fingerprintingData.forEach(fingerprint => {
            website = fingerprint.website;
            console.log("[Fingerprinting] Website:", website, fingerprint.top_level_url);
            saveFingerprinting(fingerprint, website);
        });
    } else {
        console.error("Expected an array of fingerprinting data");
        console.log(typeof fingerprintingData);
        console.log(fingerprintingData);
    }
    res.send("fingerprinting-success");
})

app.listen(port, () => {
    console.log(`PixelGraph server listening at http://localhost:${port}`);
})