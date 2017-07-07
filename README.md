# liferay-npm-build-tools

<!--
[![Build Status](https://travis-ci.org/liferay/liferay-npm-build-tools.svg?branch=master)](https://travis-ci.org/liferay/liferay-npm-build-tools)
-->

## Setup

1. Install NodeJS >= [v6.11.0](http://nodejs.org/dist/v6.11.0/), if you don't have it yet.

2. Install lerna global dependency:

  ```
  [sudo] npm install -g lerna
  ```

3. Run the bootstrap script to install local dependencies and link packages together:

  ```
  npm run lerna
  ```

4. Build all packages

  ```
  npm run build
  ```

5. Run tests:

  ```
  npm run test
  ```
