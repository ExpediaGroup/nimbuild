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

    it('Builds development bundles from `entry`', async () => {
        const response = await webpacknimbuild.run({entry, minify: false});
        expect(response).toMatchSnapshot();
    });

    it('Builds production bundles from `entry`', async () => {
        const response = await webpacknimbuild.run({entry, minify: true});
        expect(response).toMatchSnapshot();
    });

    it('Builds empty string with empty `entry`', async () => {
        const response = await webpacknimbuild.run({entry: [], minify: true});
        expect(response).toMatchSnapshot();
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
});
