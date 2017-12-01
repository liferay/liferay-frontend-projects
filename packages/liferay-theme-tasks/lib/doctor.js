'use strict';

const _ = require('lodash');
const gutil = require('gulp-util');

const lfrThemeConfig = require('./liferay_theme_config');

const chalk = gutil.colors;

// This array contains all theme versions supported for non-upgrade tasks
const supportedThemeVersions = ['7.0', '7.1'];

// This array contains all theme versions supported for upgrade tasks
const supportedUpgradeVersions = ['6.2'];

function doctor(
	{themeConfig = null, haltOnMissingDeps = false, tasks = []} = {}
) {
	themeConfig = themeConfig || lfrThemeConfig.getConfig(true);

	if (!themeConfig) {
		return;
	}

	assertTasksSupported(themeConfig.liferayTheme.version, tasks);

	let dependencies = themeConfig.dependencies || {};

	if (!_.isEmpty(themeConfig.devDependencies)) {
		dependencies = _.defaults(dependencies, themeConfig.devDependencies);
	}

	let rubySass = themeConfig.liferayTheme.rubySass;

	if (
		!_.isUndefined(themeConfig.liferayTheme.supportCompass) &&
		_.isUndefined(rubySass)
	) {
		rubySass = themeConfig.liferayTheme.supportCompass;

		lfrThemeConfig.setConfig({
			rubySass: rubySass,
		});

		lfrThemeConfig.removeConfig(['supportCompass']);
	}

	let missingDeps = checkMissingDeps(dependencies, rubySass);

	checkDependencySources(themeConfig.liferayTheme);

	if (haltOnMissingDeps) {
		haltTask(missingDeps);
	}
}

/**
 * Check if a given array of tasks is supported for the current theme version.
 * @param {String} version the theme version
 * @param {Array} tasks the list of tasks requested through the CLI
 * @throws if any of the tasks is not supported in the given version
 */
function assertTasksSupported(version, tasks) {
	for (let task of tasks) {
		switch (task) {
		case 'help':
			break;

		case 'upgrade':
			if (supportedUpgradeVersions.indexOf(version) == -1) {
				throw new Error(
					`Task '${task}' is not supported for themes with ` +
							`version '${version}' in this version of ` +
							`'liferay-theme-tasks'`
				);
			}
			break;

		default:
			if (supportedThemeVersions.indexOf(version) == -1) {
				throw new Error(
					`Task '${task}' is not supported for themes with ` +
							`version '${version}' in this version of ` +
							`'liferay-theme-tasks'`
				);
			}
			break;
		}
	}
}

function checkDependencySources(liferayTheme) {
	let baseTheme = liferayTheme.baseTheme;
	let themeletDependencies = liferayTheme.themeletDependencies;

	let localDependencies = [];

	if (_.isObject(baseTheme) && baseTheme.path) {
		localDependencies.push(baseTheme);
	}

	if (themeletDependencies) {
		_.forEach(themeletDependencies, function(item) {
			if (item.path) {
				localDependencies.push(item);
			}
		});
	}

	if (localDependencies.length) {
		logLocalDependencies(localDependencies);
	}
}

function checkMissingDeps(dependencies, rubySass) {
	let missingDeps = 0;

	missingDeps = logMissingDeps(
		dependencies,
		'liferay-theme-deps-7.0',
		missingDeps
	);

	if (rubySass) {
		missingDeps = logMissingDeps(
			dependencies,
			'gulp-ruby-sass',
			missingDeps
		);
	}

	return missingDeps;
}

function haltTask(missingDeps) {
	if (missingDeps > 0) {
		throw new Error('Missing ' + missingDeps + ' theme dependencies');
	}
}

function logLocalDependencies(localDependencies) {
	let dependenciesString = _.map(localDependencies, function(item) {
		return item.name;
	}).join(', ');

	gutil.log(
		chalk.yellow('Warning:'),
		'you have dependencies that are installed from local modules. These should only be used for development purposes. Do not publish this npm module with those dependencies!'
	);
	gutil.log(chalk.yellow('Local module dependencies:'), dependenciesString);
}

function logMissingDeps(dependencies, moduleName, missingDeps) {
	if (!dependencies[moduleName]) {
		gutil.log(
			chalk.red('Warning:'),
			'You must install the correct dependencies, please run',
			chalk.cyan('npm i --save-dev', moduleName),
			'from your theme directory.'
		);

		missingDeps++;
	}

	return missingDeps;
}

module.exports = {
	doctor,
};
