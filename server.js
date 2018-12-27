require('dotenv').config();
const container = require('./services/container');
const bodyParser = require("body-parser");
const express = require('express');
const app = express();

const root_router = require('./api');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', root_router);

app.listen(8080, function(){
    console.log('listening on 8080');
});

let package = {name: 'fetch', version: 'latest'}

const promise = container["VulnerabilitiesService"].findVulnerabilities(package.name, package.version, (vulnerabilities) => {
    console.log(vulnerabilities);
}, (err) => {
    console.log(err);
});
promise.then(res => {
    console.log(res);
})