const pkgName = require('../package.json').name;
const LOG_INFO = ['info', pkgName];
const LOG_WARNING = ['warning', pkgName];
const LOG_ERROR = ['error', pkgName];

module.exports = {
    LOG_INFO,
    LOG_WARNING,
    LOG_ERROR
};
