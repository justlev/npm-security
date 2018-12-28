const container = require('../../services/container');

async function getPackageDependencies(req, res){
    const {packageName, packageVersion} = req.params;
    try{
        const packageDependencies = await container["PackageInfoProvider"].getPackageDependenciesHash(packageName, packageVersion);
        res.send(packageDependencies);
    }
    catch(er){
        res.send(er);
    }
}

module.exports = {
    getPackageDependencies
}