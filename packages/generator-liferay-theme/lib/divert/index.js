'use strict';

let _ = require('lodash');

function divert(moduleName, version) {
  version = version || divert.defaultVersion;

  if (!version) {
    throw new Error('No version provided');
  }

  let module = {};

  module = Object.assign(module, safeRequire(`./common/${moduleName}`));
  module = Object.assign(module, safeRequire(`./${version}/${moduleName}`));

  return module;
}

divert.defaultVersion = null;

function safeRequire(moduleName) {
  let module = {};

  try {
    module = require(moduleName);
  } catch (err) {
    if (err.message !== `Cannot find module '${moduleName}'`) {
      throw err;
    }
  }

  if (!_.isPlainObject(module)) {
    throw new Error(
      'Only modules exporting plain objects can be used with divert'
    );
  }

  return module;
}

module.exports = divert;
