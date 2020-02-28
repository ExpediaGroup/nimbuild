// 3rd party
const browserslist = require('browserslist');
// user
const {LOG_ERROR} = require('./constants');
const {getModules} = require('./module-resolver');
const {
    addSupported,
    clearSupported,
    getSupported,
    initializeSupported,
    getBaseFeatureModules
} = require('./supported-sets');
const webpacknimbuild = require('@vrbo/nimbuild-webpack')({
    maxLength: 100000
});

/**
 * getPolyfillString()
 * Function that generates a coreJS polyfill string given a user agent string and minify flag
 * @param {string} options.baseFeatureSet - REQUIRED. base feature set of coreJS polyfills to provide (IE "default")
 * @param {object} options.logger - Logging object to implement logging.  Requires a "log()" API
 * @param {bool} options.minify - flag on whether or not to compress assets
 * @param {string} options.overrideTargetPlatform - optional param.  Used by cache primer to directly specify a browserlist query to invoke LRU cache mechanism
 * @param {string} options.uaString - User agent string of incoming HTTP logger.
 */
async function getPolyfillString({
    include,
    exclude,
    logger,
    minify,
    overrideTargetPlatform,
    uaString
}) {
    // Resolve base feature set based on include / exclude
    const features = getBaseFeatureModules({
        include,
        exclude
    });

    // Resolve modules
    const modules = getModules({
        features,
        uaString,
        logger,
        overrideTargetPlatform
    });

    // Calculate webpack entry
    const entry = modules.corejs
        .map((it) => `core-js/modules/${it}`)
        .concat(modules.normal);
    try {
        const response = await webpacknimbuild.run({
            entry,
            minify,
            modifyScript: (script) => {
                // Wrap response
                return `!function (undefined) { 'use strict'; ${script} }();`;
            }
        });
        return response;
    } catch (err) {
        logger.log(
            LOG_ERROR,
            `getPolyfillString webpack compile exception: "${err.message}".`
        );
        throw new Error(err);
    }
}

/**
 * primeCache()
 * Initializes LRU cache for optimal run-time performance
 * @param {object} logger - REQUIRED.  logger object (must implement log() API)
 */
async function primeCache(logger) {
    // Get all target platforms
    const browsers = browserslist('> 0%');
    browsers.push('defaults');
    const start = Date.now();
    logger.log(
        'priming known coreJS polyfills...',
        Object.keys(getSupported())
    );
    const featureSets = Object.keys(getSupported());
    for (let i = 0; i < featureSets.length; i++) {
        const featureSet = featureSets[i];
        const {include, exclude} = getSupported(featureSet);
        for (let j = 0; j < browsers.length; j++) {
            const browser = browsers[j];
            await getPolyfillString({
                include,
                exclude,
                logger: {
                    log: () => {}
                },
                minify: true,
                overrideTargetPlatform: browser
            });
        }
        logger.log(
            `finished priming ${featureSet} in ${Date.now() -
                start}ms (cache now has ${
                webpacknimbuild.cache.keys().length
            } entries)`
        );
    }
    return webpacknimbuild.cache.keys().length;
}

module.exports = {
    getPolyfillString,
    addSupported,
    clearSupported,
    initializeSupported,
    getSupported,
    primeCache,
    serializeCache: () => {
        return webpacknimbuild.serializeCache();
    },
    deserializeCache: (cacheString) => {
        return webpacknimbuild.deserializeCache(cacheString);
    },
    clearCache: () => {
        webpacknimbuild.clearCache();
    }
};
