const RedisCache = require('../caches/redis-cache');
const VulnerabilitiesService = require('../vulnerabilities-service');
const VulnerabilitiesProvider = require('../vulnerabilities-provider');
const conditionsHandlerFunction = require('../conditions-handler');
const PackageInfoProvider = require('../packages-service');

//By using Redis - we are offloading the cache-eviction logic to Redis itself which implements it quite well
//We can change the eviction policies in Redis config.
const cache = new RedisCache();

const instances = {
    RedisCache: cache,
    VulnerabilitiesService: new VulnerabilitiesService(
        new VulnerabilitiesProvider(),
        conditionsHandlerFunction,
        cache,
        new PackageInfoProvider(cache)
        )
};


// This might have a problem with caching, explained here: https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
// Not dealing with that at the moment
module.exports = instances; 