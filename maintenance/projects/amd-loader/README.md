> :warning: This project is now deprecated.
> These tools are deprecated as of Liferay 2024.Q4/7.4 GA129, and they are planned for future removal. Modern browsers (and Liferay DXP) all support including JavaScript ECMAScript modules directly, so these tools are no longer needed.

---

# AMD Module Loader

![global](https://github.com/liferay/liferay-frontend-projects/workflows/global/badge.svg)

This repository holds the AMD Loader packed with Liferay DXP.

Note that, though it may be used outside of Liferay, it's very unprobable that
it can be useful without the extensive support it gets from the server (for
module resolution and load).

## Setup

1. Clone this repository
2. Install NodeJS >= [v10.15.1](http://nodejs.org/dist/v10.15.1/), if you don't have it yet
3. Run `yarn` to install dependencies
4. Run `yarn build` to build it
5. Run `yarn test` to run tests

This will build the loader in 'build/loader' directory. There will be three versions:

-   loader.js: release version
-   loader-min.js: minified release version
-   loader-debug.js: debug version

## How to run the demo?

The default configuration and the demo require a combo loader that is automatically started and listens to port 3000.

1. Run demo script with `yarn demo`
2. Open a browser and load [http://localhost:8080](http://localhost:8080)
3. Open the browser console and look for the messages
