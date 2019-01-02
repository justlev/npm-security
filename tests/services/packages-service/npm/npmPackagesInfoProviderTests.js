require('../../../config');
const chai = require('chai');
chai.should();
const responseObj = { test: 'test' };

const queryingResponseObj = { versions: { "1.0.0": {}, "0.9.8": {}, "1.0.1": {} } };

const fetchMock = require('fetch-mock');
const subject = require('../../../../services/packages-service/npm');

describe('#getPackageInfo', () => {
    const packageName = 'lodash';
    const packageVersion = '1.0.0';

    describe("proper response is returned", () => {
        it('resolves with the NPM response', (done) => {
            fetchMock.get(getNpmRequestUrl(packageName, packageVersion), responseObj, {overwriteRoutes: true});
            const promise = subject.getPackageInfo(packageName, packageVersion);
            promise.then((actual) => {
                actual.should.be.deep.eq(responseObj);
                done();
            });
            promise.catch((err) => {
                done(err);
            })
        });
    });
});

describe('#getExactMatchingVersion', () => {
    const packageName = 'lodash';
    const packageVersion = '^1.0.0';

    describe("proper response is returned", () => {
        it('resolves with the NPM response', (done) => {
            fetchMock.get(getNpmQueryingUrl(packageName), queryingResponseObj, {overwriteRoutes: true});
            const promise = subject.getExactMatchingVersion(packageName, packageVersion);
            promise.then((actual) => {
                actual.should.be.deep.eq("1.0.1");
                done();
            });
            promise.catch((err) => {
                done(err); 
            })
        });
    });
});

function getNpmRequestUrl(packageName, packageVersion) {
    const baseUrl = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
    return `${baseUrl}${packageName}/${packageVersion}`;
}

function getNpmQueryingUrl(packageName) {
    const baseUrl = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
    return `${baseUrl}${packageName}`;
}