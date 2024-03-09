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
const jsonfile = require('jsonfile');
let website = ['null'];

// Saving received data

async function saveRequest(receivedHTTPRequest, website) {
    const filename = 'output/' + website + '/request.json';
    jsonfile.writeFile(filename, receivedHTTPRequest, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveRequestInfo(receivedHTTPRequest, website) {
    const filename = 'output/' + website + '/requestInfo.json';
    jsonfile.writeFile(filename, receivedHTTPRequest, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveResponse(receivedHTTPResponse, website) {
    const filename = 'output/' + website + '/response.json';
    jsonfile.writeFile(filename, receivedHTTPResponse, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveStorage(receivedStorageInfo, website) {
    const filename = 'output/' + website + '/storage.json';
    jsonfile.writeFile(filename, receivedStorageInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveEventSet(receivedEventInfo, website) {
    const filename = 'output/' + website + '/eventSet.json';
    jsonfile.writeFile(filename, receivedEventInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveEventGet(receivedEventInfo, website) {
    const filename = 'output/' + website + '/eventGet.json';
    jsonfile.writeFile(filename, receivedEventInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveScript(receivedScriptInfo, website) {
    const filename = 'output/' + website + '/script.json';
    jsonfile.writeFile(filename, receivedScriptInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveElement(receivedElementInfo, website) {
    const filename = 'output/' + website + '/element.json';
    jsonfile.writeFile(filename, receivedElementInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveProperty(receivedPropertyInfo, website) {
    const filename = 'output/' + website + '/property.json';
    jsonfile.writeFile(filename, receivedPropertyInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveFingerprinting(receivedFingerprintingInfo, website) {
    const filename = 'output/' + website + '/fingerprinting.json';
    jsonfile.writeFile(filename, receivedFingerprintingInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}


// Listening for incoming requests

app.post('/request', (req, res) => {
    if (req.body.http_req != `http://localhost:${port}/storage`) {
        req.body.top_level_url = website[0];
        saveRequest(req.body, website[0]);
    }
    res.send("request-success");
})

app.post('/requestInfo', (req, res) => {
    saveRequestInfo(req.body, website[0]);
    res.send("requestInfo-success");
})

app.post('/response', (req, res) => {
    saveResponse(req.body, website[0]);
    res.send("response-success");
})

app.post('/storage', (req, res) => {
    saveStorage(req.body, website[0]);
    res.send("storage-success");
})

app.post('/eventSet', (req, res) => {
    saveEventSet(req.body, website[0]);
    res.send("eventSet-success");
})

app.post('/eventGet', (req, res) => {
    saveEventGet(req.body, website[0]);
    res.send("eventGet-success");
})

app.post('/script', (req, res) => {
    saveScript(req.body, website[0]);
    res.send("script-success");
})

app.post('/element', (req, res) => {
    saveElement(req.body, website[0]);
    res.send("element-success");
})

app.post('/property', (req, res) => {
    saveProperty(req.body, website[0]);
    res.send("property-success");
})

app.post('/fingerprinting', (req, res) => {
    saveFingerprinting(req.body, website[0]);
    res.send("fingerprinting-success");
})

app.listen(port, () => {
    console.log(`PixelGraph server listening at http://localhost:${port}`);
})