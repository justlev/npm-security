const semver = require('semver');

//This is extracted to an external function so that here we can cache versions as well, and reset the cache when needed.
function findMatchingVersion(allVersions, matchingPattern){

    // The following versions lookup can be optimised:
    const sortedVersions = allVersions.sort();
    const matchingVersions = sortedVersions.filter(item => semver.satisfies(item, matchingPattern));
    if (matchingVersions.length == 0 ){
        return null;
    }
    const matchingVersion = matchingVersions[matchingVersions.length-1];
    return matchingVersion;
}

module.exports = findMatchingVersion;