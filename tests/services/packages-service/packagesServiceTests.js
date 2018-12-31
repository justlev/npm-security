process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.should();
const sinon = require('sinon');
const mockRequire = require('mock-require');
const PackageInfoProvider = require('../../../services/packages-service');

describe('PackageInfoProvider', () => {
    describe('#getPackageDependenciesHash', () => {
        describe('no cache', () => {
            describe('package without dependencies', () => {
                it('should request info of packages from NPM', (done) => {
                    const packageName = 'lodash';
                    const packageVersion = '1.0.0';
                    const rootPackageResponse = {
                        _id: `${packageName}@${packageVersion}`,
                        dependencies: []
                    };
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(packageName, packageVersion).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    const subject = new PackageInfoProvider(npmStub, null)
        
                    const actual = subject.getPackageDependenciesHash(packageName, packageVersion);
                    actual.should.not.be.null;
                    const keys = Object.keys(actual).length;
                    keys.should.be.eq(0);
                    done(); 
                });
            });

            describe('package with dependencies', () => {
                it('should request info of packages from NPM', (done) => {
                    const packageName = 'lodash';
                    const packageVersion = '1.0.0';

                    const dependency1 = {
                        name: 'dep1',
                        version: '1.0.0',
                        dependencies: {},
                        _id: 'dep1id'
                    };

                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;
                    
                    const rootPackageResponse = {
                        _id: `${packageName}@${packageVersion}`,
                        dependencies: rootDependenciesObject
                    };
                    
                    const npmStub = sinon.stub();
                    npmStub.withArgs(packageName, packageVersion).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
        
                    const subject = new PackageInfoProvider(npmStub, null)
        
                    const promise = subject.getPackageDependenciesHash(packageName, packageVersion);
                    promise.then((actual)=> {
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(rootDependenciesObject)
                        done(); 
                    });
                });
            });
        });
    });
});

function getNpmPackageResolvedPromise(packageInfoToReturn){
    const promise = new Promise((resolve, reject) => {
        resolve(packageInfoToReturn);
    });
    return promise;
}
