require('../../config');

const chai = require('chai');
chai.should();
const sinon = require('sinon');
const PackagesService = require('../../../services/packages-service');
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

    const dependency2 = {
        name: 'dep2',
        version: '2.0.0',
        dependencies: {},
        _id: 'dep2@2.0.0'
    };

    const npmStub = sinon.stub();

    afterEach((done) => {
        npmStub.reset();
        done();
    })

    describe('#getPackageDependenciesHash', () => {
        describe('no cache', () => {
            const subject = new PackagesService(npmStub, null);
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
        
                    const subject = new PackagesService(npmStub, null)
        
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
                    const cacheKey = `pre:${rootPackage._id}`;
                    cache.get.withArgs(cacheKey).returns(getNpmPackageResolvedPromise(null));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
                    const subject = new PackagesService(npmStub, cache);
        
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
                    const cacheKey = `pre:${rootPackage._id}`;
                    cache.get.withArgs(cacheKey).returns(getNpmPackageResolvedPromise(rootDependenciesObject));
        
                    const npmStub = sinon.stub();
                    const subject = new PackagesService(npmStub, cache);
        
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
                    const cacheKey = `pre:${dependency1._id}`;
                    cache.get.withArgs(cacheKey).returns(getNpmPackageResolvedPromise({}));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    const subject = new PackagesService(npmStub, cache);
        
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

    describe("getNormalisedPackageTree", () => {
        describe("no cache", () => {
            const subject = new PackagesService(npmStub, null);
            describe("no dependencies", () => {
                it("should empty object", (done) => {
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackage));
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);
                    promise.then((actual) => {
                        actual.should.not.be.null;
                        actual.name.should.be.eq(rootPackage.name);
                        actual.version.should.be.eq(rootPackage.version);
                        actual.dependencies.should.not.be.null;
                        actual.dependencies.length.should.be.eq(0);
                        done(); 
                    });     
                    promise.catch((err) => {
                        done(err);
                    });
                });
            });

            describe("one level of dependencies", () => {
                it("should return dependencies as tree", (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;
                    
                    const rootPackageResponse = {
                        ...rootPackage,
                        dependencies: rootDependenciesObject
                    };
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);

                    const expected = {
                        ...rootPackage,
                        dependencies: [{
                            ...dependency1,
                            dependencies: []
                        }]
                    };
                    promise.then((actual) => {
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(expected);
                        done(); 
                    });     
                    promise.catch((err) => {
                        done(err);
                    });
                });
            });

            describe("multiple levels of dependencies", () => {
                it("should return dependencies as tree", (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;
                    
                    const rootPackageResponse = {
                        ...rootPackage,
                        dependencies: rootDependenciesObject
                    };

                    const dependency1DepsObj = {};
                    dependency1DepsObj[dependency2.name] = dependency2.version;
                    
                    const dependency1ResponseObj = {
                        ...dependency1,
                        dependencies: dependency1DepsObj
                    };
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1ResponseObj));
                    npmStub.withArgs(dependency2.name, dependency2.version).returns(getNpmPackageResolvedPromise(dependency2));
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);

                    const expected = {
                        ...rootPackage,
                        dependencies: [{
                            ...dependency1,
                            dependencies: [{
                                ...dependency2,
                                dependencies: []
                            }]
                        }]
                    };
                    promise.then((actual) => {
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(expected);
                        done(); 
                    });     
                    promise.catch((err) => {
                        done(err);
                    });
                });
            });
        });

        describe("with cache", () => {
            let cache = sinon.createStubInstance(RedisCache);
            beforeEach((done) => {
                cache = sinon.createStubInstance(RedisCache);
                done();
            });

            describe('package not cached', () => {
                it('should request info of packages from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;

                    const rootPackageResponse = {
                        _id: rootPackage._id,
                        dependencies: rootDependenciesObject
                    };
                    cache.get.returns(getNpmPackageResolvedPromise(null));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    npmStub.withArgs(dependency1.name, dependency1.version).returns(getNpmPackageResolvedPromise(dependency1));
                    const subject = new PackagesService(npmStub, cache);
                    
                    const expected = {...rootPackage, dependencies: [{...dependency1, dependencies: []}]};
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.calledTwice.should.be.true;
                        actual.should.be.deep.eq(expected)
                        done(); 
                    });
                });
            });

            describe('package completely cached', () => {
                it('should not request info of packages from NPM', (done) => {
                    const rootItemKey = `tree:${rootPackage._id}`;
                    const expected = {...rootPackage, dependencies: [{...dependency1, dependencies: []}]};
                    cache.get.withArgs(rootItemKey).returns(getNpmPackageResolvedPromise(expected));
        
                    const npmStub = sinon.stub();
                    const subject = new PackagesService(npmStub, cache);
                    
                    
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.called.should.be.false;
                        actual.should.be.deep.eq(expected)
                        done(); 
                    });
                });
            });

            describe('package not cached but dependency cached', () => {
                it('should request info only of root from NPM', (done) => {
                    const rootDependenciesObject = {};
                    rootDependenciesObject[dependency1.name] = dependency1.version;

                    const rootPackageResponse = {
                        ...rootPackage,
                        dependencies: rootDependenciesObject
                    };
                    const cacheKey = `tree:${dependency1._id}`;
                    const dependency1Object = {...dependency1, dependencies: []};
                    const expected = {...rootPackage, dependencies: [dependency1Object]};
                    cache.get.withArgs(cacheKey).returns(getNpmPackageResolvedPromise(dependency1Object));
        
                    const npmStub = sinon.stub();
                    npmStub.withArgs(rootPackage.name, rootPackage.version).returns(getNpmPackageResolvedPromise(rootPackageResponse));
                    const subject = new PackagesService(npmStub, cache);
        
                    const promise = subject.getNormalisedPackageTree(rootPackage.name, rootPackage.version);
                    promise.then((actual)=> {
                        npmStub.calledOnceWith(rootPackage.name, rootPackage.version).should.be.true;
                        npmStub.calledWith(dependency1.name, dependency1.version).should.be.false;
                        actual.should.not.be.null;
                        actual.should.be.deep.eq(expected)
                        done(); 
                    });
                });
            });
        });
    })
});

function getNpmPackageResolvedPromise(packageInfoToReturn){
    const promise = new Promise((resolve, reject) => {
        resolve(packageInfoToReturn);
    });
    return promise;
}
