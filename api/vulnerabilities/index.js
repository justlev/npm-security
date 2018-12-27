const container = require('../../services/container');

function getVulnerabilities(req, res){
    const {package} = req.body;
    container["VulnerabilitiesService"].findVulnerabilities(package.name, package.version, (vulnerabilities) => {
        res.send(vulnerabilities);
    }, (err) => {
        res.error(err);
    });
}

module.exports = {
    getVulnerabilities
}