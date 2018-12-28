process.env.NODE_ENV = 'test';

const chai = require('chai');
const RedisCache = require('../../../services/caches/redis-cache');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
const sinon = require('sinon');
const fetchMock = require('fetch-mock');
const server = require('../../../server');


describe('/GET/dependencies/{packageName}/{packageVersion}', () => {
    beforeEach((done) => {
        sinon.stub(RedisCache.prototype, 'get').returns(new Promise((resolve, rej) => resolve(null)));
        done();
    });

    afterEach((done) => {
        fetchMock.restore();
        RedisCache.prototype.get.restore();
        done();
    });

    describe('package without dependencies', () => {
        it('should return empty object', (done) => {
            const packageName = 'lodash';
            const packageVersion = '1.0.0';
            const requestUrl = `/dependencies/${packageName}/${packageVersion}`
            const rootPackageResponse = {
                _id: `${packageName}@${packageVersion}`,
                dependencies: []
            };
            fetchMock.get(getNpmRequestUrl(packageName, packageVersion), rootPackageResponse);
            chai.request(server)
                .get(requestUrl)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const keysCount = Object.keys(res.body).length;
                    keysCount.should.be.eql(0);
                    done();
                });
        });
    });

    describe('package with flat dependencies', () => {
        it('should return empty object', (done) => {
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
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.be.deep.equal(dependenciesObj);
                    done();
                });
        });
    });
});

function getNpmRequestUrl(packageName, packageVersion) {
    const baseUrl = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
    return `${baseUrl}${packageName}/${packageVersion}`;
}