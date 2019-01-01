const { getNpmVersionString, getNormalisedPackageName } = require('../../utilities/packageNames');

class PackageInfoProvider{
    constructor(packageInfoProvider, cache=null){
        this._cache = cache;
        this._packageInfoProvider = packageInfoProvider;
    }

    async getPackageDependenciesHash(packageName, packageVersion){
        const result = await this._getPackageDependenciesHashRecursively(packageName, packageVersion);
        return result;
    }

    async _getPackageDependenciesHashRecursively(name, version){
        const packageId = `${name}@${version}`;
        if (this._cache != null){
            try{
                const result = await this._cache.get(packageId);
                if (result != null){
                    return result;
                }
            }
            catch(ex){
                // Maybe log that error occured when redis raised error
            }
        }
        const info = await this._packageInfoProvider(getNormalisedPackageName(name), getNpmVersionString(version));
        const dependenciesObjects = {};
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                const version = info.dependencies[key];
                dependenciesObjects[key] = version;
                const childDependencies = await this._getPackageDependenciesHashRecursively(key, version);
                Object.assign(dependenciesObjects, childDependencies)
            }
        }
        if (this._cache != null){
            this._cache.set(packageId, dependenciesObjects);
        }
        return dependenciesObjects

    }

    async getNormalisedPackageTree(packageName, packageVersion){
        const obj = {name: packageName, version: packageVersion, dependencies: []};
        await this._getPackageDetailsRecursively(packageName, packageVersion, obj);
        return obj;
    }

    async _getPackageDetailsRecursively(name, version, obj){
        const info = this._packageInfoProvider(name, version);
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                let version = info.dependencies[key];
                if (version.indexOf('^')!==-1){
                    version='latest';
                }
                const depObj = {name: key, version: version, dependencies: []};
                obj.dependencies.push(depObj);
                this._getPackageDetailsRecursively(key, version, depObj);
            }
        }
    }
}

module.exports = PackageInfoProvider;