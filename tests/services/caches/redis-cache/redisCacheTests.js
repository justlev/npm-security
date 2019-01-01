require('../../../config');
const chai = require('chai');
chai.should();
const sinon = require('sinon');
const proxyquire =  require('proxyquire');
const redis = require('redis');
const redisStub = sinon.stub(redis);
proxyquire('../../../../services/caches/redis-cache', {redis: redisStub});
const RedisCache = require('../../../../services/caches/redis-cache');

const testValue = {a:1};

describe('#get', () => {
    const itemId = "id";

    describe("redis resolves promise with JSON value", () => {
        it('resolves root promise with parsed redis value', (done) => {
            const redisClientMock = {get: function(key, handler){
                handler(null,JSON.stringify(testValue));
            }};
            redisStub.createClient.returns(redisClientMock);
            const subject = new RedisCache();

            const promise = subject.get(itemId);
            promise.then((actual) => {
                actual.should.be.deep.eq(testValue);
                done();
            });
            promise.catch((err) => {
                done(err);
            })
        });
    });

    describe("redis resolves promise with error", () => {
        it('rejects root promise with error', (done) => {
            const redisError = {error: 1};
            const redisClientMock = {get: function(key, handler){
                handler(redisError,null);
            }};
            redisStub.createClient.returns(redisClientMock);
            const subject = new RedisCache();

            const promise = subject.get(itemId);
            promise.catch((err) => {
                err.should.be.deep.eq(redisError);
                done();
            });
            promise.then((actual) => {
                done(`Redis resolved promise with ${actual} while it should have been null`);
            })
        });
    });
});
