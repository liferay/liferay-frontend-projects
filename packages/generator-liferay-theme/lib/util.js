/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const gulp = require('gulp');
const {
	info,
	print,
	success,
	title,
} = require('liferay-npm-build-tools-common/lib/format');

const pkgJson = require('../package.json');
const versions = require('./versions');

const FIRST_SUPPORTED_VERSION =
	versions.supported[versions.supported.length - 1];
const LAST_SUPPORTED_VERSION = versions.supported[0];

/**
 * Returns a normalized "kebab case" version of the supplied string, suitable
 * for use as a theme (or themelet, or layout) name.
 */
function normalizeName(name) {
	return splitWords(name.replace(/[^a-z0-9-]/gi, ''))
		.join('-')
		.toLowerCase();
}

/**
 * Run `gulp init` after successful creation of a project.
 */
function runGulpInit() {
	print(
		'\n',
		success`
		The project has been created successfully.
		`
	);

	print(
		info`
		Now we will invoke {gulp init} for you, to configure your deployment
		strategy. 
		
		Remember, that you can change your answers whenever you want by 
		running {gulp init} again.
		`
	);

	// We cannot load this before the project is created because it crashes
	const liferayThemeTasks = require('liferay-theme-tasks');

	liferayThemeTasks.registerTasks({gulp});

	gulp.series('init')();
}

/**
 * Run `npm install` after successful creation of a project.
 */
function runInstall(generator) {
	const skipInstall = generator.options['skip-install'];

	if (!skipInstall) {
		generator.installDependencies({bower: false});
	}
}

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

/**
 * Returns a "snake case" version of `name` (eg. "foo_bar_baz").
 */
function snakeCase(name) {
	return splitWords(name)
		.join('_')
		.toLowerCase();
}

/**
 * Splits `input` at word boundaries.
 *
 * eg. "foo bar" -> ["foo", "bar"]
 *     "foo-bar" -> ["foo", "bar"]
 *     "foo_bar" -> ["foo", "bar"]
 *     "FooBar" -> ["foo", "bar"]
 */
function splitWords(input) {
	return input.trim().split(/[ _-]|(?<=[a-z])(?=[A-Z])/);
}

module.exports = {
	normalizeName,
	runGulpInit,
	runInstall,
	sayHello,
	snakeCase,
};
