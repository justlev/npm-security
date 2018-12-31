require('../../../config');
const chai = require('chai');
chai.should();
const responseObj = { test: 'test' };
const fetchMock = require('fetch-mock');
const subject = require('../../../../services/packages-service/npm');

describe('#getPackageInfo', () => {
    const packageName = 'lodash';
    const packageVersion = '1.0.0';

    describe("proper response is returned", () => {
        it('resolves with the NPM response', (done) => {
            fetchMock.get(getNpmRequestUrl(packageName, packageVersion), responseObj, {overwriteRoutes: true});
            const promise = subject(packageName, packageVersion);
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

function getNpmRequestUrl(packageName, packageVersion) {
    const baseUrl = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
    return `${baseUrl}${packageName}/${packageVersion}`;
}