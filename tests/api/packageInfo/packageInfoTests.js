require('../../config');

const chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const fetchMock = require('fetch-mock');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');
const redis = require('redis');
const redisStub = sinon.stub(redis);

const redisClientMock = {get: function(key, handler){
    handler(null,null);
}, set: function(key, value) {} };
redisStub.createClient.returns(redisClientMock);

proxyquire('../../../services/caches/redis-cache', {redis: redisStub});

let server = {};

describe('/GET/dependencies/{packageName}/{packageVersion}', () => {

    beforeEach((done) => {
        done();
    });

    before((done) => {
        server = require('../../../server');
        done();
    });

    after((done) => {
        server.stop();
        sinon.restore();
        done();
    });

    afterEach((done) => {
        fetchMock.restore();
        done();
    })
    
    describe('package without dependencies', () => {
        it('should return empty object', (done) => {
            const packageName = 'lodash';
            const packageVersion = '1.0.0';
            const requestUrl = `/dependencies/${packageName}/${packageVersion}`
            const rootPackageResponse = {
                _id: `${packageName}@${packageVersion}`,
                dependencies: []
            };
            fetchMock.get(getNpmRequestUrl(packageName, packageVersion), rootPackageResponse, {overwriteRoutes: true});
            chai.request(server)
                .get(requestUrl)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const keysCount = Object.keys(res.body).length;
                    keysCount.should.be.eql(0);
                    done();
                })
                .catch(function (err) {
                    done(err);
                 });
        });
    });

    describe('package with flat dependencies', () => {
        it('should return proper dependencies hashset', (done) => {
            const rootPackageName = 'lodash';
            const rootPackageVersion = '1.0.0';
            const requestUrl = `/dependencies/${rootPackageName}/${rootPackageVersion}`

            const dependency1 = {
                name: 'dep1',
                version: '1.0.0',
                dependencies: [],
                _id: 'dep1id'
            };
            fetchMock.get(getNpmRequestUrl(dependency1.name, dependency1.version), dependency1, {
                overwriteRoutes: true
            });

            const dependency2 = {
                name: 'dep2',
                version: '1.0.0',
                dependencies: [],
                _id: 'dep2id'
            };
            fetchMock.get(getNpmRequestUrl(dependency2.name, dependency2.version), dependency2, {
                overwriteRoutes: true
            });

            const dependenciesObj = {};
            dependenciesObj[dependency1.name] = dependency1.version;
            dependenciesObj[dependency2.name] = dependency2.version;

            const rootPackage = {
                name: rootPackageName,
                version: rootPackageVersion,
                dependencies: dependenciesObj,
                _id: 'rootPackageId'
            };
            fetchMock.get(getNpmRequestUrl(rootPackage.name, rootPackage.version), rootPackage, {
                overwriteRoutes: true
            });

            chai.request(server)
                .get(requestUrl)
                .then((res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.be.deep.equal(dependenciesObj);
                    done();
                })
                .catch(function (err) {
                    done(err);
                 });
        });
    });
});

function getNpmRequestUrl(packageName, packageVersion) {
    const baseUrl = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
    return `${baseUrl}${packageName}/${packageVersion}`;
}