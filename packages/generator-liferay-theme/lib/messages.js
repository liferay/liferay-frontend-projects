/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const chalk = require('chalk');
const {
	info,
	print,
	title,
} = require('liferay-npm-build-tools-common/lib/format');

const pkgJson = require('../package.json');
const versions = require('./versions');

const FIRST_SUPPORTED_VERSION =
	versions.supported[versions.supported.length - 1];
const LAST_SUPPORTED_VERSION = versions.supported[0];

/**
 * Show welcome message
 * @param {Generator} generator
 */
function sayHello(generator) {
	const generatorNamespace = generator.options.namespace;

	print(
		title`
		

		Welcome to the splendid Themes SDK generator!
		
		`,
		info`
		This version of the Themes SDK (${pkgJson.version}) supports Liferay DXP 
		and Portal CE from ${FIRST_SUPPORTED_VERSION} to ${LAST_SUPPORTED_VERSION}.

		For older versions, please use v8 of the toolkit:
	
			> npm install -g generator-liferay-theme@^8.0.0 ↩
			> yo ${generatorNamespace} ↩

		`
	);
}

module.exports = {
	sayHello,
};
