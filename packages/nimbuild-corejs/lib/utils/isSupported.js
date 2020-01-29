const browserslist = require("browserslist");
const { features, feature: readableFeature } = require("caniuse-lite");

const featuresList = Object.keys(features);

/**
 * isSupported()
 * Function that indecate whether a browser support the feature.
 * @param {string} browsers - REQUIRED. Browsers to check the if it support the required feature param.
 * @param {string} feature - REQUIRED. Browser feature to check if the browser support it.
 * @returns {boolean}
 */
function isSupported(browsers, feature) {
    let data;
    try {
        data = readableFeature(features[feature]);
    } catch(e) {
        throw new ReferenceError(`Please provide a proper feature name. Cannot find ${feature}`);
    }

    const browserList = browserslist(browsers, { ignoreUnknownVersions: true });

    if(browserList && browserList.length > 0) {
        return browserList.map((browser) => {
            return browser.split(" ");
        }).every((browser) => {
            return data && data.stats[browser[0]] &&
                data.stats[browser[0]][browser[1]] &&
                String.prototype.toLowerCase.call(data.stats[browser[0]][browser[1]][0]) === "y"
        });
    }

    throw new ReferenceError(`browser is an unknown version: ${browsers}`);
}

module.exports = isSupported;
