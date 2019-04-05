/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const spawnSync = require('../utils/spawnSync');

const APPS_ROOT_DIR = '<AppsRootDir>';

const BUILD_ARGS = {
	'--css-common-path': './build_gradle/frontend-css-common',
	'--styled-path': `${APPS_ROOT_DIR}/frontend-theme/frontend-theme-styled/src/main/resources/META-INF/resources/_styled`,
	'--unstyled-path': `${APPS_ROOT_DIR}/frontend-theme/frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled`
};

/**
 * Walk up the directory hierarchy looking for an "apps" directory.
 * Returns `null` if none can be found.
 */
function findAppsDirectory(from = process.cwd()) {
	let current = from;
	let previous = null;

	while (current !== previous) {
		const apps = path.join(current, 'apps');
		if (fs.existsSync(apps)) {
			return apps;
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
	args.forEach(arg => {
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
	const apps = findAppsDirectory();
	if (!apps) {
		throw new Error('Unable to find "apps" directory');
	}

	const themes = path.join(apps, 'frontend-theme');
	if (!fs.existsSync(themes)) {
		throw new Error('Unable to find "frontend-theme" directory');
	}

	const args = [];
	Object.keys(BUILD_ARGS).forEach(key => {
		const value = BUILD_ARGS[key];
		args.push(key, value.replace(APPS_ROOT_DIR, apps));
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
	findAppsDirectory,
	prepareAdditionalBuildArgs,
	run
};
