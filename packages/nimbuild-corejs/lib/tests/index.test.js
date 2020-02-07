const {getPolyfillString, clearCache, primeCache} = require('../index');
const {getSupported} = require('../supported-sets');
const mockuas = require('../mocks/ua.mock');

let mockFail = false;

/**
 * TODO: fix JEST mocking webpack in symlink context (TravisCI)
 *
jest.mock('webpack', () => {
    return (config) => {
        const webpack = jest.requireActual('webpack');
        const compiler = webpack(config);
        let realRun = compiler.run;
        compiler.run = function(fn) {
            if (mockFail) {
                return fn('webpack run failed');
            }
            return realRun.apply(compiler, arguments);
        };
        return compiler;
    };
});
*/

describe('index.js', () => {
    let mockLogger;
    let include;
    let exclude;

    beforeEach(() => {
        clearCache();
        mockFail = false;
        mockLogger = {
            log: jest.fn()
        };
        const featureSet = getSupported('default', {
            log: console.log
        });
        include = featureSet.include;
        exclude = featureSet.exclude;
    });

    it('handles UA not defined in browserlist', async () => {
        const polyfill = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.invalid,
            minify: false,
            logger: mockLogger
        });

        expect(mockLogger.log).toBeCalledWith(
            ['warning', '@vrbo/nimbuild-corejs'],
            `coreJS module mapping failed for uaString="${mockuas.invalid}" to targetPlatform="${mockuas.invalid}" (message: "Unknown browser query \`${mockuas.invalid}\`. Maybe you are using old Browserslist or made typo in query.")`
        );
        expect(mockLogger.log).toBeCalledWith(
            ['warning', '@vrbo/nimbuild-corejs'],
            `using fallback query for userAgent="${mockuas.invalid}"`
        );
        expect(polyfill.entry).toMatchSnapshot();
    });

    it('creates chrome corejs unminified polyfills', async () => {
        const polyfills = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.chrome,
            minify: false,
            logger: mockLogger
        });
        expect(polyfills.entry).toMatchSnapshot();
    });

    it('proactively handles future versions of chrome family by assuming latest supported', async () => {
        const polyfills = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.chrome999,
            minify: false,
            logger: mockLogger
        });
        expect(polyfills.entry).toMatchSnapshot();
        expect(polyfills.script.length).toEqual(0);
    });

    it('creates chrome corejs minified polyfills', async () => {
        const polyfills = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.chrome,
            minify: true,
            logger: mockLogger
        });

        expect(polyfills.entry).toMatchSnapshot();
        expect(polyfills.script.length).toBeLessThan(10000);
    });

    it('creates ie11 corejs minified polyflls', async () => {
        const polyfills = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.ie11,
            minify: true,
            logger: console
        });

        expect(polyfills.entry).toMatchSnapshot();
        expect(polyfills.script.length).toMatchSnapshot();
    });

    /*
    TODO: resolve failures that happen in Travis CI when mocking webpack exceptions
    it('handles webpack compile failures', async () => {
        mockFail = true;
        try {
            await getPolyfillString({
                include,
                exclude,
                uaString: mockuas.ie11,
                minify: true,
                logger: mockLogger
            });
        } catch (e) {
            // do nothing
        }
        expect(mockLogger.log).toBeCalledWith(
            ['error', '@vrbo/nimbuild-corejs'],
            'getPolyfillString webpack compile exception: "webpack run failed".'
        );
    });
    */

    it('render no polyfills for modern browser', async () => {
        let polyfillString = await getPolyfillString({
            include,
            exclude,
            uaString: mockuas.chrome,
            minify: true,
            logger: mockLogger
        });

        expect(polyfillString.script).toEqual('');
    });

    it('handles various UA strings', async () => {
        try {
            for (let i = 0; i < mockuas.oddGroup.length; i++) {
                const polyfills = await getPolyfillString({
                    include,
                    exclude,
                    uaString: mockuas.oddGroup[i],
                    minify: true,
                    logger: mockLogger
                });

                expect(polyfills.entry).toMatchSnapshot();
            }
        } catch (e) {
            // Fail test (expose exception in test runner)
            expect(e.message).toEqual('error handling UA');
        }
    }, 20000);

    it('memoizes for build performance (100 executions in less than 1 second)', async () => {
        for (let i = 0; i < 100; i++) {
            await getPolyfillString({
                include,
                exclude,
                uaString: mockuas.ie11,
                minify: true,
                logger: mockLogger
            });
        }
    }, 1000);

    it('cache primes in less than 120 seconds', async (done) => {
        const cacheLength = await primeCache({
            log: console.log
        });

        expect(cacheLength).toEqual(94);
        done();
    }, 120000);
});
