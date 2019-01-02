const NPM_PACKAGES_URL = process.env["NPM_PACKAGES_URL"] || "https://registry.npmjs.org/";
const semver = require('semver');
const findMatchingVersion = require('../versions');
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
        const matchingVersion = findMatchingVersion(versions, packageVersion);
        if (matchingVersion == null){
            reject("No matching versions found");
            return;
        }
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