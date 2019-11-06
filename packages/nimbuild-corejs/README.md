# @vrbo/nimbuild-corejs

[![NPM Version](https://img.shields.io/npm/v/@vrbo/nimbuild-corejs.svg?style=flat-square)](https://www.npmjs.com/package/@vrbo/nimbuild-corejs)
[![Build Status](https://travis-ci.org/expediagroup/nimbuild.svg?branch=master)](https://travis-ci.org/expediagroup/nimbuild)

Performant generation of coreJS polyfill bundles optimized for target browsers at runtime

## Why

Read: https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md#better-optimization-of-polyfill-loading

> A service like this one integrated with a good polyfills source like core-js, which only loads the needed polyfills by statically analyzing the source like Babel's useBuiltIns: usage option does could cause a revolution in the way we think about polyfills.

This module is the core of what is needed to fulfill the next generation approach to loading polyfills.

## Installation

```bash
npm install --save @vrbo/nimbuild-corejs
```

## Usage

Import module and prime cache

```javascript
const {primeCache} = require('@vrbo/nimbuild-corejs');
primeCache(); // async, takes up to 20 seconds
```

When processing an HTTP request, generate coreJS polyfill string with this usage:

```javascript
const {getPolyfillString} = require('@vrbo/nimbuild-corejs');
const coreJSData = await getPolyfillString({
    include: ['es.*'],
    exclude: [],
    logger: {log: console.log},
    minify: true,
    uaString: http.headers['user-agent']
});
return coreJSData.script; // polyfill string
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
