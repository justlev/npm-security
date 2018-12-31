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
        const info = await this._packageInfoProvider(getNormalisedPackageName(name), getNpmVersionString(version));
        //TODO: Problem with repos like this one: https://www.npmjs.com/package/@emotion/hash
        if (this._cache != null){
            //console.log(`accessing redis for ${name}:${version} with id: ${info._id}`)
            const result = await this._cache.get(info._id);
            if (result != null){
                return result;
            }
        }
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
            this._cache.set(info._id, dependenciesObjects);
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