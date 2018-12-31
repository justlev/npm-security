process.env.NODE_ENV = 'test';

const chai = require('chai');
chai.should();
const sinon = require('sinon');
const mockRequire = require('mock-require');
const PackageInfoProvider = require('../../../services/packages-service');
const RedisCache = require('../../../services/caches/redis-cache');

describe('PackageInfoProvider', () => {
    const rootPackage = {
        _id: `lodash@1.0.0`,
        name: 'lodash',
        version: '1.0.0',
        dependencies: {}
    };

    const dependency1 = {
        name: 'dep1',
        version: '1.0.0',
        dependencies: {},
        _id: 'dep1@1.0.0'
    };

    const npmStub = sinon.stub();

    afterEach((done) => {
        npmStub.reset();
        done();
    })

    describe('#getPackageDependenciesHash', () => {
        describe('no cache', () => {
            const subject = new PackageInfoProvider(npmStub, null);
            describe('package without dependencies', () => {
                it('should request info of packages from NPM', (done) => {
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackage));
                    const promise = subject.getPackageDependenciesHash(rootPackage.name, rootPackage.version);
                    promise.then((actual) => {
                        actual.should.not.be.null;
                        const keys = Object.keys(actual).length;
                        keys.should.be.eq(0);
                        done(); 
                    });
                });
            });

            describe('package with dependencies', () => {
                it('should request info of packages from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;
                    
                    const rootPackageResponse = {
                        _id: rootPackage._id,
                        dependencies: rootDependenciesObject
                    };
                    
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
        
                    const subject = new PackageInfoProvider(npmStub, null)
        
                    const promise = subject.getPackageDependenciesHash(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(rootDependenciesObject)
                        done(); 
                    });
                });
            });
        });

        describe('with cache', () => {
            let cache = sinon.createStubInstance(RedisCache);
            beforeEach((done) => {
                cache = sinon.createStubInstance(RedisCache);
                done();
            })
            describe('package not cached', () => {
                it('should request info of packages from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;

                    const rootPackageResponse = {
                        _id: rootPackage._id,
                        dependencies: rootDependenciesObject
                    };
                    
                    cache.get.withArgs(rootPackage._id).returns(getNpmPackageResolvedPromise(null));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
                    const subject = new PackageInfoProvider(npmStub, cache);
        
                    const promise = subject.getPackageDependenciesHash(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.calledTwice.should.be.true;
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(rootDependenciesObject)
                        done(); 
                    });
                });
            });

            describe('package completely cached', () => {
                it('should not request info of packages from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;

                    const rootPackageResponse = {
                        _id: rootPackage._id,
                        dependencies: rootDependenciesObject
                    };
                    
                    cache.get.withArgs(rootPackage._id).returns(getNpmPackageResolvedPromise(rootDependenciesObject));
        
                    const npmStub = sinon.stub();
                    const subject = new PackageInfoProvider(npmStub, cache);
        
                    const promise = subject.getPackageDependenciesHash(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.called.should.be.false;
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(rootDependenciesObject)
                        done(); 
                    });
                });
            });

            describe('package not cached but dependency cached', () => {
                it('should request info only of root from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;

                    const rootPackageResponse = {
                        _id: rootPackage._id,
                        dependencies: rootDependenciesObject
                    };
                    
                    cache.get.withArgs(dependency1._id).returns(getNpmPackageResolvedPromise({}));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    const subject = new PackageInfoProvider(npmStub, cache);
        
                    const promise = subject.getPackageDependenciesHash(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.calledOnceWith(rootPackage.name, rootPackage.version).should.be.true;
                        npmStub.calledWith(dependency1.name, dependency1.version).should.be.false;
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
