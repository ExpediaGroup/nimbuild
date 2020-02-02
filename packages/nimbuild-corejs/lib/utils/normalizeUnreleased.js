const browserslist = require('browserslist');

/**
 * normalizeUnreleased()
 * Given a family and a version, ensure return only supported versions
 * IE, if given chrome 100 and browserlist data only supports up to chrome 99, use chrome 99.
 *
 * @param {string} family - "Chrome"
 * @param {string} major - "89"
 * @returns string version
 */
function normalizeUnreleased(family, major) {
    try {
        const latestFamilyVersion = browserslist(`last 1 ${family} version`);
        const latestVersion = latestFamilyVersion[0].match(/([\d]+)/g);
        const latestVersionMajor = latestVersion[0];
        if (parseInt(major, 10) > parseInt(latestVersionMajor, 10)) {
            return latestVersionMajor;
        }
        return major;
    } catch (e) {
        // exception occurred.  Return major version and allow upstream calling functions
        // to handle logic.
        return major;
    }
}

module.exports = normalizeUnreleased;
