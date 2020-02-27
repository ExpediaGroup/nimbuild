# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.0

### Breaking

-   nimbuild-corejs now requires call to `initializeSupported()` to define desired support polyfills

### Added

-   Added serialize/deserialize cache methods to nimbuild-corejs to enable better cold start / boot up times.
-   Updated unit tests

## 0.3.0

-   nimbuild-corejs now supports `CustomEvent` polyfill

## 0.2.0

### Added

-   nimbuild-webpack and nimbuild-corejs include `cached` and `timeElapsed` properties in response for better logging
-   enable renovate

## 0.1.1

### Fixed

-   Support for future versions of browser platforms

## 0.1.0

### Added

-   `Intersection Observer` polyfill added to packages/nimbuild-corejs

## 0.0.3

### Added

-   Released Initial Version
