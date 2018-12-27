const NPM_PACKAGES_URL = process.env["NPM_PACKAGES_URL"];
const fetch = require('node-fetch');

async function getPackageInfo(packageName, packageVersion){
    const promise = new Promise((resolve, reject) => {
        fetch(NPM_PACKAGES_URL+`${packageName}/${packageVersion}`, { method: 'GET', headers: {"Content-Type": "application/json"}})
        .then((res) =>{
            return res.json()
        } ).then(json => {
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

module.exports = getPackageInfo;