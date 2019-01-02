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
    getNormalisedPackageName
};