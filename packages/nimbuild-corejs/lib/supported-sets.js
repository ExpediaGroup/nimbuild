const modulesList = Object.keys(require('core-js-compat/data'));
const hash = require('object-hash');

const {LOG_ERROR} = require('./constants');

const supported = {
    default: {
        include: [
            'es.symbol',
            'es.array',
            'es.date',
            'es.function',
            'es.json',
            'es.map',
            'es.number',
            'es.object',
            'es.promise',
            'es.regexp',
            'es.set',
            'es.string.code-point-at',
            'es.string.ends-with',
            'es.string.from-code-point',
            'es.string.includes',
            'es.string.iterator',
            'es.string.match',
            'es.string.match-all',
            'es.string.pad-end',
            'es.string.pad-start',
            'es.string.repeat',
            'es.string.replace',
            'es.string.search',
            'es.string.split',
            'es.string.starts-with',
            'es.string.trim',
            'es.string.trim-end',
            'es.string.trim-start',
            'web.dom-collections.for-each',
            'web.dom-collections.iterator',
            'web.queue-microtask',
            'web.url-search-params'
        ],
        exclude: []
    }
};

/**
 * getSupported()
 * Function that returns an object that contains an "include" and "exclude" property to determine coreJS module set
 * @param {string} featureSet - string value of feature set to lookup in privately scoped variable "supported"
 * @param {object} logger - Logging object to implement logging.  Requires a "log()" API
 */
function getSupported(featureSet, logger) {
    if (typeof featureSet === 'undefined') {
        return supported;
    }
    const fallbackKey = Object.keys(supported)[0];
    const features = supported[featureSet];
    if (typeof features === 'undefined') {
        logger.log(
            LOG_ERROR,
            `no featureSet "${featureSet}" was found, fallback to ${fallbackKey}`
        );
        return supported[fallbackKey];
    }

    return features;
}

/**
 * addSupported()
 * Adds a support set to internal definitions
 * @param {*} featureSet
 * @param {*} options.include - coreJS modules to include
 * @param {*} options.exclude - coreJS modules to exclude
 */
function addSupported(featureSet, {include, exclude}) {
    // sanity check `features.include` and `features.exclude`
    if (!include || !exclude) {
        throw new Error(`Invalid feature set defined: "${featureSet}"`);
    }

    supported[featureSet] = {
        include,
        exclude
    };
}

/**
 * getAvailableCoreJsFeatures()
 * Create set of coreJS features available for polyflls
 * @param {array} include - Array of coreJS modules to include
 * @param {array} exclude - Array of coreJS modules to exclude
 */
function getAvailableCoreJSFeatures(include, exclude) {
    const featureSet = new Set();

    function filter(method, list) {
        for (const ns of list) {
            for (const name of modulesList) {
                if (name === ns || name.startsWith(`${ns}.`)) {
                    featureSet[method](name);
                }
            }
        }
    }
    // Target "es.*" and "web.*" features from core-js
    filter('add', include);

    // filter function for feature set reduction
    filter('delete', exclude);

    return modulesList.filter((it) => featureSet.has(it));
}

/**
 * getBaseFeatureSet()
 * Function that builds internal dictionary of known base feature sets (IE "default")
 * @param {string} name - Name of feature set
 * @param {object} config - config object (see below properties)
 * @param {array} config.include - Array of coreJS modules to include
 * @param {array} config.exclude - Array of coreJS modules to exclude
 */
const baseFeatureSetCache = {};

function getBaseFeatureModules({include, exclude}) {
    const cacheKey = hash({
        include,
        exclude
    });
    if (baseFeatureSetCache[cacheKey]) {
        return baseFeatureSetCache[cacheKey];
    }
    baseFeatureSetCache[cacheKey] = getAvailableCoreJSFeatures(
        include,
        exclude
    );
    return baseFeatureSetCache[cacheKey];
}

module.exports = {
    addSupported,
    getSupported,
    getBaseFeatureModules
};
