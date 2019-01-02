const { getNormalisedPackageName } = require('../../utilities/packageNames');

class PackagesService{
    constructor(packageInfoProvider, packageVersionProvider, cache=null){
        this._cache = cache;
        this._packageInfoProvider = packageInfoProvider;
        this._packageVersionProvider = packageVersionProvider;
        this._treeCachePrefix="tree:";
    }

    async getNormalisedPackageTree(packageName, packageVersion, includeRoot = true){
        const rootVersion = await this._packageVersionProvider(packageName, packageVersion);
        const packageId = `${packageName}@${rootVersion}`;
        const obj = {_id: packageId, name: packageName, version: rootVersion, dependencies: []};
        await this._getPackageDetailsRecursively(getNormalisedPackageName(packageName), rootVersion, obj);
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
                // Maybe log that error occured when redis raised error.
                // Continue flow so client doesn't experience cache errors.
            }
        }

        const info = await this._packageInfoProvider(name, version);
        if (typeof(info.dependencies) !== 'undefined'){
            const dependenciesKeys = Object.keys(info.dependencies);
            for (let i = 0;i<dependenciesKeys.length;i++){
                const key = dependenciesKeys[i];
                const normalisedKey = getNormalisedPackageName(key);
                const version = info.dependencies[key];
                const normalisedVersion = await this._packageVersionProvider(normalisedKey, version);
                const dependencyId = `${normalisedKey}@${normalisedVersion}`;
                const depObj = {_id: dependencyId, name: normalisedKey, version: normalisedVersion, dependencies: []};
                obj.dependencies.push(depObj);
                await this._getPackageDetailsRecursively(key, normalisedVersion, depObj);
            }
        }

        if (this._cache != null){
            this._cache.set(`${this._treeCachePrefix}${packageId}`, obj);
        }
    }

    async getPackageDependenciesHash(packageName, packageVersion){
        const tree = await this.getNormalisedPackageTree(packageName, packageVersion);
        const hash = {};
        this._flattenTree(tree, hash);
        delete hash[packageName];
        return hash;
    }

    _flattenTree(currentObj, hash={}){
        const name = currentObj.name;
        if(hash[name] !== null && typeof(hash[name]) !== 'undefined'){
            if (hash[name] !== currentObj.version){
                const currentValue = hash[name];
                hash[name] = [currentValue, currentObj.version];
            }
        }
        else{
            hash[name] = currentObj.version;
        }
        for(let i=0;i<currentObj.dependencies.length;i++){
            const dependency = currentObj.dependencies[i];
            this._flattenTree(dependency, hash);
        }
    }
}

module.exports = PackagesService;