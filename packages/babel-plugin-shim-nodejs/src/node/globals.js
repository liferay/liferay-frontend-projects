import {getPackageDir} from 'liferay-npm-build-tools-common/lib/packages';

// List of built-in Node.js v7.10.0 globals.
// Get the full list from https://nodejs.org/docs/latest/api/globals.html
const defaultGlobals = {
  Buffer: 'var Buffer = require("liferay-node-buffer");',
  __dirname: function(filePath) {
    const pkgDir = getPackageDir(filePath);

    let dirname = filePath.substring(pkgDir.length + 1);
    dirname = dirname.substring(0, dirname.lastIndexOf('/'));

    return `var __dirname = '/${dirname}';`;
  },
  __filename: function(filePath) {
    const pkgDir = getPackageDir(filePath);

    let filename = filePath.substring(pkgDir.length + 1);

    return `var __filename = '/${filename}';`;
  },
  clearImmediate: 'require("liferay-node-setimmediate");',
  // clearInterval: already provided by the browser
  // clearTimeout: already provided by the browser
  // console: already provided by the browser
  global: 'var global = window;',
  process: 'var process = require("liferay-node-process");',
  setImmediate: 'require("liferay-node-setimmediate");',
  // setInterval: already provided by the browser
  // setTimeout: already provided by the browser
};

export default defaultGlobals;
