'use strict';

function isPlainObject(value) {
	return (
		value !== null &&
		Object.prototype.toString.call(value) === '[object Object]'
	);
}

let lfrThemeConfig = require('../liferay_theme_config');

function divert(moduleName, version = null) {
	if (!version) {
		let config = lfrThemeConfig.getConfig();

		version = config ? config.version : divert.defaultVersion;
	}

	let module = {};

	module = Object.assign(module, safeRequire(`./common/${moduleName}`));
	module = Object.assign(module, safeRequire(`./${version}/${moduleName}`));

	return module;
}

divert.defaultVersion = '7.1';

function safeRequire(moduleName) {
	let module = {};

	try {
		module = require(moduleName);
	} catch (err) {
		if (err.message !== `Cannot find module '${moduleName}'`) {
			throw err;
		}
	}

	if (!isPlainObject(module)) {
		throw new Error(
			'Only modules exporting plain objects can be used with divert'
		);
	}

	return module;
}

module.exports = divert;
