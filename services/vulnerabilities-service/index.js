class VulnerabilitiesService{
    constructor(vulnerabilitiesProvider, conditionsHandlerFunction, vulnerabilitiesCache, packageInfoProvider){
        this._vulnerabilitiesProvider = vulnerabilitiesProvider;
        this._packageInfoProvider = packageInfoProvider;
        this._conditionsHandler = conditionsHandlerFunction;
        this._cache = vulnerabilitiesCache;
    }

    async findVulnerabilities(packageName, packageVersion){
        // this._cache.get(packageId, (cacheEntry) => {
        //     if (typeof(cacheEntry) !== 'undefined'){
        //         onSuccess(cacheEntry);
        //         return;
        //     }
        // });
        return await this._packageInfoProvider.getPackageDependenciesHash(packageName, packageVersion);
//
//

        const packageTree = await _packageInfoProvider.getNormalisedPackageTree(packageName, packageVersion);
        const computationPromise = new Promise((resolve, reject) => {
            const foundVulnerabilities = this.findVulnerabilitiesRecursively(packageInfo, null);
            resolve(foundVulnerabilities);
        });
        return computationPromise.then(res => onSuccess(res));
        return computationPromise;
    }

    findVulnerabilitiesRecursively(currentPackage, parent, foundVulnerabilities = []){
        for (let i=0;i<currentPackage.dependencies;i++){
            const dependency = currentPackage.dependencies[i];
            return findVulnerabilitiesRecursively(dependency, currentPackage, foundVulnerabilities);
        }
        const vulnerablePackage = getVulnerabilities(currentPackage.name, currentPackage.version);
        if (vulnerablePackage != null){
            foundVulnerabilities.push(vulnerablePackage);
            this._cache.reportVulnerabilityFound(vulerablePackage, parent);
        }
        return foundVulnerabilities;
    }

    getVulnerablePackage(packageName, packageVersion){
        const affectedVersionsContainer = this._vulnerabilitiesProvider.fetchAffectedVersions(packageName);
        if (typeof(affectedVersionsContainer) === 'undefined') return false;
        const matchExists = this._conditionsHandler(packageVersion);
        return matchExists;
    }
};

module.exports = VulnerabilitiesService
