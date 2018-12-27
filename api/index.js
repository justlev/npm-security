var express = require('express');
var router = express.Router();
const { getVulnerabilities } = require('./vulnerabilities');

router.get('/vulnerabilities/:packageName/:packageVersion', getVulnerabilities);

module.exports = router;