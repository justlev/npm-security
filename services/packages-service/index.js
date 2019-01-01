const { getNpmVersionString, getNormalisedPackageName } = require('../../utilities/packageNames');

class PackagesService{
    constructor(packageInfoProvider, cache=null){
        this._cache = cache;
        this._packageInfoProvider = packageInfoProvider;
    }

    async getPackageDependenciesHash(packageName, packageVersion){
        const result = await this._getPackageDependenciesHashRecursively(getNormalisedPackageName(packageName), getNpmVersionString(packageVersion));
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
        const info = await this._packageInfoProvider(name, version);
        const dependenciesObjects = {};
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                const normalisedKey = getNormalisedPackageName(key);
                const version = info.dependencies[key];
                const normalisedVersion = getNpmVersionString(version);
                dependenciesObjects[normalisedKey] = normalisedVersion;
                const childDependencies = await this._getPackageDependenciesHashRecursively(normalisedKey, normalisedVersion);
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
        await this._getPackageDetailsRecursively(getNormalisedPackageName(packageName), getNpmVersionString(packageVersion), obj);
        return obj;
    }

    async _getPackageDetailsRecursively(name, version, obj){
        const info = this._packageInfoProvider(name, version);
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                const normalisedKey = getNormalisedPackageName(key);
                const version = info.dependencies[key];
                const normalisedVersion = getNpmVersionString(version);
                const depObj = {name: normalisedKey, version: normalisedVersion, dependencies: []};
                obj.dependencies.push(depObj);
                this._getPackageDetailsRecursively(key, version, depObj);
            }
        }
    }
}

module.exports = PackagesService;