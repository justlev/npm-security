const chai = require('chai');
chai.should();
const sinon = require('sinon');

const subject = require('../../../utilities/packageNames').getNormalisedPackageName;

describe("#getNormalisedPackageName", () => {
    describe("regular package name", () => {
        it("should return same package name", (done) => {
            const packageName = "lodash";
            const actual = subject(packageName)
            actual.should.be.eq(packageName);
            done();
        });
    });

    describe("package name with namespace", () => {
        it("should return add namespace to package name", (done) => {
            const packageName = "@mates/lodash";
            const expected = "mates-lodash";
            const actual = subject(packageName);
            actual.should.be.eq(expected);
            done();
        });
    });
});
