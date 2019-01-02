var express = require('express');
var router = express.Router();
const { getPackageDependencies, getPackageDependenciesAsTree } = require('./packageInfo');

router.get('/dependencies/:packageName/:packageVersion', getPackageDependencies);
router.get('/dependenciesTree/:packageName/:packageVersion', getPackageDependenciesAsTree);

module.exports = router;