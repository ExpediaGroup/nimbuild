// 3rd party
const compat = require('core-js-compat');
const {resolveUserAgent} = require('browserslist-useragent');
const caniuse = require('caniuse-api');

// user
const {LOG_INFO, LOG_WARNING} = require('./constants');
const FALLBACK_TARGET_PLATFORM = 'defaults';

/**
 * detectIfBrowserHasFetch()
 * Function when given a UA string, returns true if browser implements fetch
 * @param {string} targetPlatform - browserlist query for target support
 */
function detectIfBrowserHasFetch(targetPlatform) {
    // detect if fetch should be used
    return caniuse.isSupported('fetch', targetPlatform);
}

/**
 * getCoreJSModulesByPlatform()
 * Resolves coreJS modules by platform
 * @param {array} options.features - REQUIRED. list of feature modules to possibly include.
 * @param {object} options.logger - Logging object to implement logging.  Requires a "log()" API
 * @param {array} options.targetPlatforms - target platforms to use when calculating applicable coreJS modules
 * @param {string} options.uaString - User agent string of incoming HTTP logger.
 */
function getCoreJSModulesByPlatform({
    features,
    logger,
    targetPlatforms,
    uaString
}) {
    // Always fallback to a safe target platform `FALLBACK_TARGET_PLATFORM``
    targetPlatforms.unshift(FALLBACK_TARGET_PLATFORM);

    while (targetPlatforms.length > 0) {
        const targetToAttempt = targetPlatforms.pop();
        if (
            targetToAttempt === FALLBACK_TARGET_PLATFORM &&
            typeof uaString !== 'undefined'
        ) {
            logger.log(
                LOG_WARNING,
                `using fallback query for userAgent="${uaString}"`
            );
        }
        try {
            const targetModules = compat({
                targets: [targetToAttempt],
                filter: features
            });
            logger.log(
                LOG_INFO,
                `coreJS module mapping successful for uaString="${uaString}" to targetPlatform="${targetToAttempt}"`
            );
            return {
                modules: targetModules.list,
                targetPlatform: targetToAttempt
            };
        } catch (e) {
            // Log error and fallback to safer set of polyfills.
            logger.log(
                LOG_WARNING,
                `coreJS module mapping failed for uaString="${uaString}" to targetPlatform="${targetToAttempt}" (message: "${e.message}")`
            );
        }
    }
    // Should never reach this point
    /* istanbul ignore next */
    throw new Error('getModulesForUA() total failure');
}

/**
 * getCoreJSModulesByUserAgent()
 * Resolves coreJS modules by user agent string
 * @param {array} options.features - REQUIRED. list of feature modules to possibly include.
 * @param {object} options.logger - Logging object to implement logging.  Requires a "log()" API
 * @param {string} options.uaString - User agent string of incoming HTTP logger.
 */
function getCoreJSModulesByUserAgent({features, uaString, logger}) {
    const {family, version} = resolveUserAgent(uaString);

    // Build versions to attempt building
    let targetsToAttempt = [`${family}`];

    // Build target platform by family and major/minor (if non-zero values)
    const versionArray = version.match(/([\d]+)/g);

    const major = versionArray[0];
    const minor = versionArray[1];

    targetsToAttempt.push(`${family} ${major}`);
    targetsToAttempt.push(`${family} ${major}.${minor}`);

    return getCoreJSModulesByPlatform({
        features,
        uaString,
        logger,
        targetPlatforms: targetsToAttempt
    });
}

/**
 * getModules()
 * Function that given parameters, returns an array of coreJS and other polyfill module paths that can be resolved by webpack
 * @param {array} options.features - REQUIRED. list of feature modules to possibly include.
 * @param {object} options.logger - Logging object to implement logging.  Requires a "log()" API
 * @param {string} options.overrideTargetPlatform - optional param.  Used by cache primer to directly specify a browserlist query to invoke LRU cache mechanism
 * @param {string} options.uaString - User agent string of incoming HTTP logger.
 */
function getModules({features, logger, overrideTargetPlatform, uaString}) {
    let modules = {
        normal: []
    };
    let targetPlatform;
    if (!overrideTargetPlatform) {
        // Resolve by user agent
        const results = getCoreJSModulesByUserAgent({
            features,
            uaString,
            logger
        });
        modules.corejs = results.modules;
        targetPlatform = results.targetPlatform;
    } else {
        // Resolve by target platform
        const results = getCoreJSModulesByPlatform({
            features,
            logger,
            targetPlatforms: [overrideTargetPlatform]
        });
        modules.corejs = results.modules;
        targetPlatform = results.targetPlatform; // need to re-assign in case target platofrm fails in `getCoreJSModulesByPlatform()`
    }
    if (!detectIfBrowserHasFetch(targetPlatform)) {
        modules.normal.push('whatwg-fetch');
    }

    return modules;
}

module.exports = {
    getModules
};
