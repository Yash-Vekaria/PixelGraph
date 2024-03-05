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
    const filename = 'output/' + website + '/responses.json';
    jsonfile.writeFile(filename, receivedHTTPResponse, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function saveStorage(receivedStorageInfo, website) {
    const filename = 'output/' + website + '/localStorage.json';
    jsonfile.writeFile(filename, receivedStorageInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

async function debugInfo(receivedDebugInfo, website) {
    const filename = 'output/' + website + '/debug.json';
    jsonfile.writeFile(filename, receivedDebugInfo, {
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

async function saveScriptId(receivedScriptInfo, website) {
    const filename = 'output/' + website + '/scriptIds.json';
    jsonfile.writeFile(filename, receivedScriptInfo, {
        flag: 'a'
    }, function(err) {
        if (err) console.error(err);
    })
}

// Listening for incoming requests

app.post('/request', (req, res) => {
    if (req.body.http_req != `http://localhost:${port}/localStorage`) {
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

app.post('/localStorage', (req, res) => {
    saveStorage(req.body, website[0]);
    res.send("localStorage-success");
})

app.post('/eventSet', (req, res) => {
    saveEventSet(req.body, website[0]);
    res.send("eventSet-success");
})

app.post('/eventGet', (req, res) => {
    saveEventGet(req.body, website[0]);
    res.send("eventGet-success");
})

app.post('/scriptId', (req, res) => {
    saveScriptId(req.body, website[0]);
    res.send("scriptId-success");
})

app.post('/debug', (req, res) => {
    debugInfo(req.body, website[0]);
    res.send("debug-success");
})

app.listen(port, () => {
    console.log(`PixelGraph server listening at http://localhost:${port}`);
})