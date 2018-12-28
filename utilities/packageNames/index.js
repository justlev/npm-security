function getNpmVersionString(version){
    if (version.indexOf('~') !== -1){
        const versionOnly = version.substring(1, version.length);
        const splitted = versionOnly.split('.');
        const toReturn = splitted.reduce((total, item, i) => {
            if (i==splitted.length-1){
                return total+".*";
            }
            return total+"."+item;
        });
        return toReturn;
    }

    if (version.indexOf('^') !== -1){
        return "latest"; // This is incorrect since we need to support latest minor version and not just latest
        // For now keeping it this way until we can either use an external tool or implement my own logic to find latest minor
    }
    return version;
}

function getNormalisedPackageName(packageName){
    if (packageName.indexOf('/') !== -1){
        const splitted = packageName.split('/');
        let namespace = splitted[0];
        if (namespace.indexOf('@') == 0){
            namespace = namespace.substring(1, namespace.length);
        }
        const finalName = namespace+"-"+splitted[1];
        return finalName;
    }
    return packageName;
}

module.exports = {
    getNpmVersionString,
    getNormalisedPackageName
};