const redis = require('redis');

class RedisCache{
    constructor(){
        this._client = new redis.createClient(process.env["REDIS_URL"] || "redis://localhost:6379/0");
    }

    set(key, value){
        const jsonValue = JSON.stringify(value);
        this._client.set(key, jsonValue); // not hsets at the moment
    }

    async get(key){
        return new Promise((resolve, reject) => {
            this._client.get(key, function (err, reply) {
                if (err !== null && typeof(err) !== 'undefined'){
                    reject(err);
                }
                else{
                    const obj = JSON.parse(reply);
                    resolve(obj);   
                }
            });
        });
    }
}

module.exports = RedisCache;