const RedisCache = require('../caches/redis-cache');
const VulnerabilitiesService = require('../vulnerabilities-service');
const VulnerabilitiesProvider = require('../vulnerabilities-provider');
const conditionsHandlerFunction = require('../conditions-handler');
const PackagesService = require('../packages-service');
const npmInfoProvider = require('../packages-service/npm');

//By using Redis - we are offloading the cache-eviction logic to Redis itself which implements it quite well
//We can change the eviction policies in Redis config.
const cache = new RedisCache();
const packagesService = new PackagesService(npmInfoProvider, cache);

const instances = {
    RedisCache: cache,
    PackagesService:  packagesService,
    VulnerabilitiesService: new VulnerabilitiesService(
        new VulnerabilitiesProvider(),
        conditionsHandlerFunction,
        cache,
        packagesService
        )
};


// This might have a problem with caching, explained here: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
// Not dealing with that at the moment
module.exports = instances; 