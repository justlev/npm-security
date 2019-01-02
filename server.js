require('dotenv').config();
const bodyParser = require("body-parser");
const express = require('express');
const app = express();

const root_router = require('./api');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/', root_router);

const server = app.listen(8080, function(){
    console.log('listening on 8080');
});

function stop(){
    server.close();
}

module.exports = server;
module.exports.stop = stop;