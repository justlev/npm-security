const NPM_PACKAGES_URL = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
const semver = require('semver')
require('isomorphic-fetch');

async function getPackageInfo(packageName, packageVersion){
    const promise = new Promise((resolve, reject) => {
        fetch(NPM_PACKAGES_URL+`${packageName}/${packageVersion}`, { method: 'GET', headers: {"Content-Type": "application/json"}})
        .then((res) =>{
            return res.json()
        }).then(json => {
            resolve(json);
        })
        .catch(
            (err) => {
                console.log(packageName)
                console.log(packageVersion)
                reject(err);
            }
        );
    });
    return promise;
}

async function getExactMatchingVersion(packageName, packageVersion){
    const promise = new Promise(async (resolve, reject) => {
        if (semver.clean(packageVersion) === packageVersion){
            resolve(packageVersion);
            return;
        }
        const packageContainer = await queryPackageDetails(packageName);
        // The following versions lookup can be optimised:
        const versions = Object.keys(packageContainer.versions);
        const sortedVersions = versions.sort();
        const matchingVersions = sortedVersions.filter(item => semver.satisfies(item, packageVersion));
        if (matchingVersions.length == 0 ){
            reject("No matching versions found");
            return;
        }
        const matchingVersion = matchingVersions[matchingVersions.length-1];
        resolve(matchingVersion);
    });

    return promise;
}


async function queryPackageDetails(packageName){
    const promise = new Promise((resolve, reject) => {
        fetch(NPM_PACKAGES_URL+`${packageName}`, { method: 'GET', headers: {"Content-Type": "application/json"}})
        .then((res) =>{
            return res.json()
        }).then(json => {
            resolve(json);
        })
        .catch(
            (err) => {
                reject(err);
            }
        );
    });
    return promise;
}

module.exports = {getPackageInfo, getExactMatchingVersion};