const path = require('path');
// Since we run jest in a browser environment (unit testing server + client), we need to
// patch setTimeout to polyfill an API in setTimeout() so we can mock webpack
const webpacknimbuild = require('../index')({
    maxLength: 100000
});
let mockFail = false;
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
describe('nimbuild-webpack.js', () => {
    beforeEach(() => {
        mockFail = false;
    });

    const entry = ['preact'];

    it('Throw an error when given an entry of type "Object"', async () => {
        const operation = async () => {
            return await webpacknimbuild.run({
                entry: {
                    foo: path.join(__dirname, './mocks/foo')
                },
                minify: false
            });
        };
        expect(operation()).rejects.toThrow(
            new Error('run() does not support entry of Object type')
        );
    });

    it('Return true/false `cached` properties depending on if building a unique entry', async () => {
        let response = await webpacknimbuild.run({
            entry: [path.join(__dirname, './mocks/foo')],
            minify: false
        });
        expect(response.cached).toEqual(false);

        response = await webpacknimbuild.run({
            entry: [path.join(__dirname, './mocks/foo')],
            minify: false
        });
        expect(response.cached).toEqual(true);
    });

    it('Builds development bundles from `entry`', async () => {
        const response = await webpacknimbuild.run({entry, minify: false});
        expect(response.script).toMatchSnapshot();
        expect(response.entry).toMatchSnapshot();
    });

    it('Builds production bundles from `entry`', async () => {
        const response = await webpacknimbuild.run({entry, minify: true});
        expect(response.script).toMatchSnapshot();
        expect(response.entry).toMatchSnapshot();
    });

    it('Builds empty string with empty `entry`', async () => {
        const response = await webpacknimbuild.run({entry: [], minify: true});
        expect(response.entry).toEqual([]);
        expect(response.script).toEqual('');
    });

    it('Implements `modifyScript` properly', async () => {
        const response = await webpacknimbuild.run({
            entry: ['blank_module'],
            minify: true,
            modifyScript: (script) => {
                return `a${script}1`;
            }
        });
        expect(response.script).toEqual('a1');
    });

    it('Throws webpack errors', async (done) => {
        mockFail = true;
        try {
            await webpacknimbuild.run({entry: ['zzz'], minify: true});
            expect(true).toEqual('should have failed');
        } catch (e) {
            // do nothing
            expect(e.message).toEqual('webpack run failed');
            done();
        }
    });

    it('Runs 100 builds quickly', async (done) => {
        for (let i = 0; i < 100; i++) {
            await webpacknimbuild.run({entry, minify: true});
        }
        done();
    });

    it('Serialize and deserialize LRU cache', async (done) => {
        // given, when
        webpacknimbuild.clearCache();
        const configs = [
            {
                entry: [path.join(__dirname, './mocks/foo')],
                minify: true
            },
            {
                entry: path.join(__dirname, './mocks/foo'),
                minify: true
            }
        ];

        for (config of configs) {
            await webpacknimbuild.run(config);
        }

        // then, assert cache
        const cached = webpacknimbuild.serializeCache();
        expect(cached).toMatchSnapshot();
        webpacknimbuild.clearCache();
        webpacknimbuild.deserializeCache(cached);
        expect(webpacknimbuild.serializeCache()).toMatchSnapshot();

        // then, asset subsequent runs result in cached
        for (config of configs) {
            const response = await webpacknimbuild.run(config);
            expect(response.cached).toEqual(true);
            expect(response.script).toMatchSnapshot();
        }
        done();
    });
});
