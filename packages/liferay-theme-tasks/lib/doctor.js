'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var lfrThemeConfig = require('./liferay_theme_config');

var chalk = gutil.colors;

module.exports = function(themeConfig, halt) {
	themeConfig = themeConfig || lfrThemeConfig.getConfig(true);

	if (!themeConfig) {
		return;
	}

	var dependencies = themeConfig.dependencies || {};

	if (!_.isEmpty(themeConfig.devDependencies)) {
		dependencies = _.defaults(dependencies, themeConfig.devDependencies);
	}

	var liferayVersion = themeConfig.liferayTheme.version;
	var rubySass = themeConfig.liferayTheme.rubySass;

	if (!_.isUndefined(themeConfig.liferayTheme.supportCompass) && _.isUndefined(rubySass)) {
		rubySass = themeConfig.liferayTheme.supportCompass;

		lfrThemeConfig.setConfig({
			rubySass: rubySass
		});

		lfrThemeConfig.removeConfig(['supportCompass']);
	}

	var missingDeps = 0;

	if (liferayVersion === '7.0') {
		missingDeps = logMissingDeps(dependencies, 'liferay-theme-deps-7.0', missingDeps);

		if (rubySass) {
			missingDeps = logMissingDeps(dependencies, 'gulp-ruby-sass', missingDeps);
		}
	}
	else if (liferayVersion === '6.2') {
		missingDeps = logMissingDeps(dependencies, 'liferay-theme-deps-6.2', missingDeps);

		if (!rubySass) {
			missingDeps = logMissingDeps(dependencies, 'gulp-sass', missingDeps);
		}
	}

	checkDependencySources(themeConfig.liferayTheme);

	if (halt) {
		haltTask(missingDeps);
	}
};

function checkDependencySources(liferayTheme) {
	var baseTheme = liferayTheme.baseTheme;
	var themeletDependencies = liferayTheme.themeletDependencies;

	var localDependencies = [];

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

function haltTask(missingDeps) {
	if (missingDeps > 0) {
		throw new Error('Missing ' + missingDeps + ' theme dependencies');
	}
}

function logLocalDependencies(localDependencies) {
	var dependenciesString = _.map(localDependencies, function(item) {
		return item.name;
	}).join(', ');

	gutil.log(chalk.yellow('Warning:'), 'you have dependencies that are installed from local modules. These should only be used for development purposes. Do not publish this npm module with those dependencies!');
	gutil.log(chalk.yellow('Local module dependencies:'), dependenciesString);
}

function logMissingDeps(dependencies, moduleName, missingDeps) {
	if (!dependencies[moduleName]) {
		gutil.log(chalk.red('Warning:'), 'You must install the correct dependencies, please run', chalk.cyan('npm i --save-dev', moduleName), 'from your theme directory.');

		missingDeps++;
	}

	return missingDeps;
}
