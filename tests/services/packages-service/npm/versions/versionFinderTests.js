const chai = require('chai');
chai.should();
const subject = require('../../../../../services/packages-service/versions');

const versions = ["1.0.0", "1.0.1", "1.0.2", "2.0.0"];

//Mock Semver as well to get isolated tests, not relying on their correctness.

describe('#findMatchingVersion', () => {
    describe('when looking for a matching version', () => {
        describe('a match exists', () => {
            const pattern = "^1.0.0";
            const expected = "1.0.2";
            it('requests the matching one from semver at all times', (done) => {
                const actual = subject(versions, pattern);

                actual.should.be.eq(expected);
                done();
            });
        });

        describe('a match doesnt exist', () => {
            const pattern = "~3.0.0";
            it("returns null", (done) => {
                const actual = subject(versions, pattern);

                actualIsNull = actual == null;
                actualIsNull.should.be.true;
                done();
            });
        })
    });
});