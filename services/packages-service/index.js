const { getNpmVersionString, getNormalisedPackageName } = require('../../utilities/packageNames');

class PackagesService{
    constructor(packageInfoProvider, cache=null){
        this._cache = cache;
        this._packageInfoProvider = packageInfoProvider;

        this._flatCachePrefix="pre:";
        this._treeCachePrefix="tree:";
    }

    async getPackageDependenciesHash(packageName, packageVersion){
        const result = await this._getPackageDependenciesHashRecursively(getNormalisedPackageName(packageName), getNpmVersionString(packageVersion));
        return result;
    }

    async _getPackageDependenciesHashRecursively(name, version){
        const packageId = `${name}@${version}`;
        if (this._cache != null){
            try{
                const result = await this._cache.get(`${this._flatCachePrefix}${packageId}`);
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
                dependenciesObjects[normalisedKey] = version;
                const childDependencies = await this._getPackageDependenciesHashRecursively(normalisedKey, normalisedVersion);
                Object.assign(dependenciesObjects, childDependencies)
            }
        }
        if (this._cache != null){
            this._cache.set(`${this._flatCachePrefix}${packageId}`, dependenciesObjects);
        }
        return dependenciesObjects

    }

    async getNormalisedPackageTree(packageName, packageVersion){
        const packageId = `${packageName}@${packageVersion}`;
        const obj = {_id: packageId, name: packageName, version: packageVersion, dependencies: []};
        await this._getPackageDetailsRecursively(getNormalisedPackageName(packageName), getNpmVersionString(packageVersion), obj);
        return obj;
    }

    async _getPackageDetailsRecursively(name, version, obj){
        const packageId = `${name}@${version}`;
        if (this._cache != null){
            try{
                const result = await this._cache.get(`${this._treeCachePrefix}${packageId}`);
                if (result != null){
                    Object.assign(obj, result);
                    return;
                }
            }
            catch(ex){
                // Maybe log that error occured when redis raised error
            }
        }

        const info = await this._packageInfoProvider(name, version);
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                const normalisedKey = getNormalisedPackageName(key);
                const version = info.dependencies[key];
                const normalisedVersion = getNpmVersionString(version);
                const dependencyId = `${normalisedKey}@${normalisedVersion}`;
                const depObj = {_id: dependencyId, name: normalisedKey, version: version, dependencies: []};
                obj.dependencies.push(depObj);
                await this._getPackageDetailsRecursively(key, normalisedVersion, depObj);
            }
        }

        if (this._cache != null){
            this._cache.set(`${this._treeCachePrefix}${packageId}`, obj);
        }
    }
}

module.exports = PackagesService;