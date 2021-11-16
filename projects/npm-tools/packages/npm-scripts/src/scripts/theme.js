/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const spawnSync = require('../utils/spawnSync');

const MODULES_DIR = '<RootDir>';

const BUILD_ARGS = {
	'--css-common-path': path.normalize('build_gradle/frontend-css-common'),
	'--sass-include-paths': path.normalize(`${MODULES_DIR}/node_modules`),
	'--styled-path': path.normalize(
		`${MODULES_DIR}/apps/frontend-theme/frontend-theme-styled/src/main/resources/META-INF/resources/_styled`
	),
	'--unstyled-path': path.normalize(
		`${MODULES_DIR}/apps/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled`
	),
};

/**
 * Walk up the directory hierarchy looking for a "modules" directory.
 * Returns `null` if none can be found.
 */
function findModulesDirectory(from = process.cwd()) {
	let current = from;
	let previous = null;

	while (current !== previous) {
		if (path.basename(current) === 'modules') {
			return current;
		}
		previous = current;
		current = path.dirname(current);
	}

	return null;
}

/**
 * Checks to make sure that the caller isn't supplying any build arguments that
 * conflict with the ones that we want to set.
 */
function checkExistingBuildArgs(args) {
	const reservedArgs = new Set(Object.keys(BUILD_ARGS));
	args.forEach((arg) => {
		if (reservedArgs.has(arg)) {
			throw new Error(
				`Must not supply ${arg} when invoking \`theme build\``
			);
		}
	});
}

/**
 * Returns an array of additional build arguments required to build a theme.
 */
function prepareAdditionalBuildArgs() {
	const modules = findModulesDirectory();

	if (!modules) {
		throw new Error('Unable to find "modules" directory');
	}

	const themes = path.join(modules, 'apps/frontend-theme');

	if (!fs.existsSync(themes)) {
		throw new Error('Unable to find "frontend-theme" directory');
	}

	const args = [];
	Object.keys(BUILD_ARGS).forEach((key) => {
		const value = BUILD_ARGS[key];

		args.push(key, value.replace(MODULES_DIR, modules));
	});

	return args;
}

/**
 * Wrapper to run `gulp` tasks for a theme in the liferay-portal repo.
 */
function run(...subcommandAndArgs) {
	const [subcommand, ...args] = subcommandAndArgs;

	switch (subcommand) {
		case 'build':
			checkExistingBuildArgs(args);
			args.unshift(...prepareAdditionalBuildArgs());
			break;

		default:

			// Pass-through.

			break;
	}

	spawnSync('gulp', [subcommand, ...args]);
}

module.exports = {
	checkExistingBuildArgs,
	findModulesDirectory,
	prepareAdditionalBuildArgs,
	run,
};
