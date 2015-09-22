'use strict';

var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');

function getLiferayThemeModules(config, cb) {
	if (_.isUndefined(cb)) {
		cb = config;

		config = {};
	}

	var globalModules = _.isUndefined(config.globalModules) ? true : config.globalModules;

	config.keyword = config.keyword || 'liferay-theme';

	var searchFn = globalModules ? seachGlobalModules : searchNpm;

	searchFn(config, cb);
}

function getPackageJSON(theme, cb) {
	packageJson(theme.name, 'latest', function(err, pkg) {
		if (err) {
			cb(err);

			return;
		}

		cb(null, pkg);
	});
}

function isLiferayThemeModule(pkg, themelet) {
	var retVal = false;

	if (pkg) {
		var liferayTheme = pkg.liferayTheme;

		retVal = liferayTheme && (themelet ? liferayTheme.themelet : !liferayTheme.themelet);
	}

	return retVal;
}

function fetchGlobalModules(cb) {
	exec('npm list -g -j -l -p --depth=0', {
		maxBuffer: Infinity
	}, function(err, stdout, stderr) {
		var globalModules = JSON.parse(stdout);

		cb(globalModules);
	});
}

function reduceModuleResults(modules, themelet) {
	return _.reduce(modules, function(result, item, index) {
		if (isLiferayThemeModule(item, themelet)) {
			result[item.name] = item;
		}

		return result;
	}, {});
}

function seachGlobalModules(config, cb) {
	var instance = this;

	fetchGlobalModules(function(modules) {
		var dependencies = modules ? modules.dependencies : null;

		var themeResults = reduceModuleResults(dependencies, config.themelet);

		cb(themeResults);
	});
}

function searchNpm(config, cb) {
	npmKeyword(config.keyword, function(err, packages) {
		async.map(packages, getPackageJSON, function(err, results) {
			if (err) {
				cb(err);

				return;
			}

			var themeResults = reduceModuleResults(results, config.themelet);

			cb(themeResults);
		});
	});
}

module.exports.getLiferayThemeModules = getLiferayThemeModules;
