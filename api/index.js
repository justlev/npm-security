var express = require('express');
var router = express.Router();
const { getPackageDependencies } = require('./packageInfo');

router.get('/dependencies/:packageName/:packageVersion', getPackageDependencies);

module.exports = router;