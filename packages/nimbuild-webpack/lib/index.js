const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
    .BundleAnalyzerPlugin;
const Visualizer = require('webpack-visualizer-plugin');
const path = require('path');
const fs = require('fs');
const MemoryFS = require('memory-fs');

const merge = require('webpack-merge');
const hash = require('object-hash');
const LRU = require('lru-cache');

/**
 * WebpackNimbuild
 * A class that holds an LRU cache in it's state and memoizes webpack runs to optimize performance
 */
class WebpackNimbuild {
    constructor(options) {
        // internal cache structure
        this.cache = new LRU({
            max: options.maxEntries || 0, // 0 === Infinity if no specifed max option
            length: (n) => {
                return n.length;
            }
        });

        // default webpack config options
        options.webpackConfig = options.webpackConfig || {};

        // Define terser plugin for asset compression
        this.terserPlugin = new TerserPlugin({
            terserOptions: {
                parse: {
                    ecma: 8
                },
                compress: {
                    ecma: 5,
                    warnings: false,
                    comparisons: false
                },
                mangle: true,
                output: {
                    ecma: 5,
                    comments: false,
                    ascii_only: true
                },
                safari10: true
            },
            // Use multi-process parallel running to improve the build speed
            // Default number of concurrent runs: os.cpus().length - 1
            parallel: true,
            // Enable file caching
            cache: true,
            sourceMap: false
        });

        // Use memory file system to access output of webpack
        this.webpackConfiguration = merge(
            {
                output: {
                    path: '/',
                    filename: 'script.js',
                    pathinfo: false
                },
                node: {
                    global: false,
                    process: false,
                    setImmediate: false
                },
                stats: 'none',
                optimization: {
                    minimizer: [this.terserPlugin]
                },
                plugins: []
            },
            options.webpackConfig
        );
    }
    /**
     * run()
     * Returns a instance of a webpack compiler
     * @param {array} entry - Paths to modules to build
     * @param {bool} minify - Boolean when true produces minimized build
     */
    async run({entry, minify, modifyScript, ...rest}) {
        // Compute runtime
        const startTime = Date.now();

        // If no given entry, immediately return
        if (!entry || (entry && entry.length === 0)) {
            return {
                script: '',
                entry
            };
        }

        // Normalize entry by removing base path
        let normalizedEntry;
        const processDir = process.cwd();

        if (entry.map) {
            normalizedEntry = entry.map((_entry) => {
                return _entry.replace(processDir, '');
            });
        } else {
            normalizedEntry = entry.replace(processDir, '');
        }

        // Create cache key
        const cacheKey = hash({normalizedEntry, minify});

        // Check to see if we already have entry
        if (this.cache.has(cacheKey)) {
            return {
                ...this.cache.get(cacheKey),
                cached: true,
                timeElapsed: Date.now() - startTime
            };
        }

        // If not, create a webpack compiler given class configuration and arguments
        const config = merge(this.webpackConfiguration, {
            entry,
            mode: minify ? 'production' : 'none',
            ...rest
        });

        // Create webpack compiler
        const compiler = webpack(config);

        // Use memory file system to avoid disk I/O
        const memoryFileSystem = new MemoryFS();
        compiler.outputFileSystem = memoryFileSystem;

        // Execute webpack process
        return new Promise((resolve) => {
            compiler.run((err) => {
                if (err) {
                    throw new Error(err);
                }

                // Get bundle from memory
                let script = compiler.outputFileSystem.data['script.js'];
                if (!script) {
                    script = '';
                } else {
                    script = script.toString();
                }

                // If given a modifyScript function, execute
                if (modifyScript) {
                    script = modifyScript(script);
                }

                // Create response object
                const response = {
                    script,
                    entry: normalizedEntry
                };
                // Update internal LRU cache
                this.cache.set(cacheKey, response);

                // Resolve response
                resolve({
                    ...response,
                    cached: false,
                    timeElapsed: Date.now() - startTime
                });
            });
        });
    }

    /**
     * serializeCache()
     * Returns serialized cache from this.cache
     */
    serializeCache() {
        const data = this.cache.dump();
        const serializedData = JSON.stringify(data);
        return serializedData;
    }

    /**
     * deserializeCache()
     * Sets cache given serialized data
     */
    deserializeCache(serializedData) {
        const data = JSON.parse(serializedData);
        return this.cache.load(data);
    }

    /**
     * clearCache()
     * Method that clears LRU cache out
     */
    clearCache() {
        return this.cache.reset();
    }

    /**
     * analyze()
     * Partition analysis of bundle at runtime
     * NOTE: this method is still experimental
     * @param {array} p.entry - Paths to modules to build
     * @param {bool} p.minify - Boolean when true produces minimized build
     */
    /* istanbul ignore next */
    async analyze({entry, minify}) {
        // define path to report name
        const reportId = Date.now();
        const partitionReport = {
            name: `report-${reportId}-partition`,
            path: path.join(__dirname, `report-${reportId}-partition.html`)
        };
        const sunburstReport = {
            name: `report-${reportId}-sunburst.html`,
            path: path.join(__dirname, `report-${reportId}-sunburst.html`)
        };

        // If not, create a webpack compiler given class configuration and arguments
        const config = merge(this.webpackConfiguration, {
            entry,
            mode: 'development',
            stats: 'verbose',
            devtool: 'inline-source-map',
            output: {
                path: __dirname,
                filename: 'script.js',
                pathinfo: false
            },
            plugins: [
                // Make sure module IDs are deterministic within the chunk manifest
                new webpack.HashedModuleIdsPlugin(),
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: false,
                    reportFilename: partitionReport.path
                }),
                new Visualizer({
                    filename: sunburstReport.name
                })
            ]
        });

        // Create webpack compiler
        const compiler = webpack(config);

        // Use memory file system to avoid disk I/O
        const memoryFileSystem = new MemoryFS();
        compiler.outputFileSystem = memoryFileSystem;

        // Execute webpack process
        return new Promise((resolve) => {
            compiler.run((err) => {
                if (err) {
                    throw new Error(err);
                }
                // Get bundle from disk and remove it
                let partitionHtml = fs.readFileSync(
                    partitionReport.path,
                    'utf-8'
                );
                fs.unlinkSync(partitionReport.path);
                let sunburstHtml = fs.readFileSync(
                    sunburstReport.path,
                    'utf-8'
                );
                fs.unlinkSync(sunburstReport.path);

                let script = compiler.outputFileSystem.data['script.js'];

                // Create response object
                const response = {
                    html: partitionHtml,
                    script,
                    partitionHtml,
                    sunburstHtml,
                    entry
                };

                // Resolve response
                resolve(response);
            });
        });
    }
}

module.exports = (options) => {
    return new WebpackNimbuild(options);
};
