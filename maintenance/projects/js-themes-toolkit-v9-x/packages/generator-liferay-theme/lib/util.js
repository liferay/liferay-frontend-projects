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
const {argv} = require('yargs');

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
 * Prompt user or assume defaults if --qa switch was given in command line.
 * @param {Generator} generator
 * @param {object[]} prompts
 */
async function promptWithQA(generator, prompts) {
	if (argv.qa) {
		const answers = prompts.reduce((answers, prompt) => {
			let val = argv[prompt.name];

			if (val === undefined) {
				val = prompt.default;

				if (typeof val === 'function') {
					val = val(answers);
				}
			}

			answers[prompt.name] = val ? val.toString() : val;

			return answers;
		}, {});

		return answers;
	}
	else {
		return await generator.prompt(prompts);
	}
}

/**
 * Run `gulp init` after successful creation of a project.
 *
 * @param {'plugin' | 'theme'} registerTasksModule
 */
function runGulpInit(registerTasksModule) {
	print(
		'\n',
		success`
		The project has been created successfully.
		`
	);

	// Skip step if ran in QA mode

	if (argv.qa) {
		return;
	}

	print(
		info`
		Now we will invoke {gulp init} for you, to configure your deployment
		strategy. 
		
		Remember, that you can change your answers whenever you want by 
		running {gulp init} again.
		`
	);

	// We cannot load this before the project is created because it crashes

	let liferayThemeTasks;

	switch (registerTasksModule) {
		case 'plugin':
			liferayThemeTasks = require('liferay-theme-tasks/plugin');
			break;

		case 'theme':
			liferayThemeTasks = require('liferay-theme-tasks');
			break;

		default:
			throw new Error(
				`Invalid registerTasksModule parameter: ${registerTasksModule}`
			);
	}

	liferayThemeTasks.registerTasks({gulp});

	gulp.start('init');
}

/**
 * Run `npm install` after successful creation of a project.
 */
function runInstall(generator) {
	const skipInstall = generator.options['skip-install'] || argv.qa;

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


		However, this version is in maintenance mode as there is version 10.x
		with the same functionality (based on gulp 4 instead of 3).

		We recommend using version 10.x instead of 9.x whenever possible.

		For more information, see:

		https://github.com/liferay/liferay-frontend-projects/tree/master/projects/js-themes-toolkit#compatibility

		`,
		info`
		For detailed information regarding which version numbers of:

		  · {unstyled}, {styled}, {classic} and {admin} themes 
		  · {liferay-frontend-css-common} and {@clayui/css} npm packages
		  · {Bootstrap} framework

		are used by each release of Liferay DXP and Portal CE see the table at:

		https://github.com/liferay/clay/wiki/Liferay-Portal-@clayui-css-Versions

		`
	);
}

/**
 * Returns a "snake case" version of `name` (eg. "foo_bar_baz").
 */
function snakeCase(name) {
	return splitWords(name).join('_').toLowerCase();
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
	promptWithQA,
	runGulpInit,
	runInstall,
	sayHello,
	snakeCase,
};
