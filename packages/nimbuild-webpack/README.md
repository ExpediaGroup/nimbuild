# @vrbo/nimbuild-webpack

[![NPM Version](https://img.shields.io/npm/v/@vrbo/nimbuild-corejs.svg?style=flat-square)](https://www.npmjs.com/package/@vrbo/nimbuild-corejs)
[![Build Status](https://travis-ci.org/expediagroup/nimbuild.svg?branch=master)](https://travis-ci.org/expediagroup/nimbuild)

Library that provides nimbuild webpack bundling at runtime

## Why

See [nimbuild-corejs](https://github.vrbocorp.com/cnienhuis/nimbuild-corejs)

## Installation

```bash
npm install --save @vrbo/nimbuild-webpack
```

## Usage

Import module and prime cache

```javascript
const webpacknimbuild = require('@vrbo/nimbuild-webpack')();

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
