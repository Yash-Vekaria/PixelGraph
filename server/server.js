const port = 8000;

const express = require('express')
const app = express();
app.use(express.json({
    limit: '100mb'
}));

const cors = require('cors');
app.use(cors({
    credentials: true,
    origin: true
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    limit: '100mb',
    extended: true
}));
app.use(bodyParser.json({
    limit: '100mb'
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
    if (req.body.http_req != `http://localhost:${port}/storage`) {
        website = req.body.website
        req.body.top_level_url = website;
        saveRequest(req.body, website);
    }
    res.send("request-success");
})

app.post('/requestInfo', (req, res) => {
    website = req.body.website
    saveRequestInfo(req.body, website);
    res.send("requestInfo-success");
})

app.post('/response', (req, res) => {
    website = req.body.website
    saveResponse(req.body, website);
    res.send("response-success");
})

app.post('/storage', (req, res) => {
    website = req.body.website
    saveStorage(req.body, website);
    res.send("storage-success");
})

app.post('/eventSet', (req, res) => {
    website = req.body.website
    saveEventSet(req.body, website);
    res.send("eventSet-success");
})

app.post('/eventGet', (req, res) => {
    website = req.body.website
    saveEventGet(req.body, website);
    res.send("eventGet-success");
})

app.post('/script', (req, res) => {
    website = req.body.website
    saveScript(req.body, website);
    res.send("script-success");
})

app.post('/element', (req, res) => {
    website = req.body.website
    saveElement(req.body, website);
    res.send("element-success");
})

app.post('/property', (req, res) => {
    website = req.body.website
    saveProperty(req.body, website);
    res.send("property-success");
})

app.post('/fingerprinting', (req, res) => {
    website = req.body.website
    saveFingerprinting(req.body, website);
    res.send("fingerprinting-success");
})

app.listen(port, () => {
    console.log(`PixelGraph server listening at http://localhost:${port}`);
})