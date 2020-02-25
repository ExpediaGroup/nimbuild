# @vrbo/nimbuild-webpack

[![NPM Version](https://img.shields.io/npm/v/@vrbo/nimbuild-corejs.svg?style=flat-square)](https://www.npmjs.com/package/@vrbo/nimbuild-webpack)
[![Build Status](https://travis-ci.org/expediagroup/nimbuild.svg?branch=master)](https://travis-ci.org/expediagroup/nimbuild)

Library that provides nimbuild webpack bundling at runtime

## Installation

```bash
npm install --save @vrbo/nimbuild-webpack
```

## Usage

Import module and instantiate new class instance:

```javascript
const webpacknimbuild = require('@vrbo/nimbuild-webpack')({
    webpackConfig: {...}, // customize webpack compiler
    maxEntries: 100 // defaults to 0 for infinity
});
```

Get bundle string:

```javascript
async function getBundleString() {
    const response = await webpacknimbuild.run({
        entry: ['react', 'react-dom'],
        minify: true,
        modifyScript: (script) => {
            // Optionally wrap response
            return `!function (undefined) { 'use strict'; ${script} }();`;
        }
    });
    return response.script; // contains string value of bundle
}
```

Getting / Setting Cache:

```javascript
// Get serialized cache
const serializedData = webpacknimbuild.serializeCache();

// Set cache from serialized data
webpacknimbuild.deserializeCache(serializedData);
```

Configure `nimbuild-webpack` to handle ES6+ source code

```javascript
const webpacknimbuild = require('@vrbo/nimbuild-webpack')({
    webpackConfig: {
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader'
                }
            ]
        }
    }
});
```

## Development

### Starting development harness

```bash
npm start
```

### Prettier

This projects supports auto-formatting of source code! Simply find your favorite IDE from the list in the following list: https://prettier.io/docs/en/editors.html

For VSCode support, perform the following steps:

-   Launch VS Code Quick Open (Ctrl+P)
-   Paste the following command, and press enter:

```
ext install esbenp.prettier-vscode
```
