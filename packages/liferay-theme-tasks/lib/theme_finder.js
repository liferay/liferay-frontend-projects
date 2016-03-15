'use strict';

var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var lfrThemeConfig = require('./liferay_theme_config');
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');

var themeConfig = lfrThemeConfig.getConfig();

module.exports = {
	getLiferayThemeModules: function(config, cb) {
		if (_.isUndefined(cb)) {
			cb = config;

			config = {};
		}

		var globalModules = _.isUndefined(config.globalModules) ? true : config.globalModules;

		config.keyword = config.keyword || 'liferay-theme';

		var searchFn = globalModules ? this._seachGlobalModules : this._searchNpm;

		searchFn.call(this, config, cb);
	},

	getLiferayThemeModule: function(name, cb) {
		this._getPackageJSON({
			name: name
		}, function(err, pkg) {
			if (pkg && !pkg.liferayTheme || pkg && !_.contains(pkg.keywords, 'liferay-theme')) {
				pkg = null;

				err = new Error('Package is not a Liferay theme or themelet module');
			}

			cb(err, pkg);
		});
	},

	_getPackageJSON: function(theme, cb) {
		packageJson(theme.name, '*', function(err, pkg) {
			if (err) {
				cb(err);

				return;
			}

			cb(null, pkg);
		});
	},

	_isLiferayThemeModule: function(pkg, themelet) {
		var retVal = false;

		if (pkg) {
			var liferayTheme = pkg.liferayTheme;

			if (!liferayTheme) {
				return retVal;
			}

			var liferayThemeVersion = liferayTheme.version;

			if (_.isArray(liferayThemeVersion) && !_.contains(liferayThemeVersion, themeConfig.version)) {
				return retVal;
			}
			else if (!_.isArray(liferayThemeVersion) && (liferayThemeVersion != '*') && (liferayThemeVersion != themeConfig.version)) {
				return retVal;
			}

			retVal = liferayTheme && (themelet ? liferayTheme.themelet : !liferayTheme.themelet);
		}

		return retVal;
	},

	_fetchGlobalModules: function(cb) {
		exec('npm list -g -j -l -p --depth=0', {
			maxBuffer: Infinity
		}, function(err, stdout, stderr) {
			var globalModules = JSON.parse(stdout);

			cb(globalModules);
		});
	},

	_reduceModuleResults: function(modules, themelet) {
		var instance = this;

		return _.reduce(modules, function(result, item, index) {
			if (instance._isLiferayThemeModule(item, themelet)) {
				result[item.name] = item;
			}

			return result;
		}, {});
	},

	_seachGlobalModules: function(config, cb) {
		var instance = this;

		this._fetchGlobalModules(function(modules) {
			var dependencies = modules ? modules.dependencies : null;

			var themeResults = instance._reduceModuleResults(dependencies, config.themelet);

			cb(themeResults);
		});
	},

	_searchNpm: function(config, cb) {
		var instance = this;

		npmKeyword(config.keyword, function(err, packages) {
			async.map(packages, instance._getPackageJSON, function(err, results) {
				if (err) {
					cb(err);

					return;
				}

				var themeResults = instance._reduceModuleResults(results, config.themelet);

				cb(themeResults);
			});
		});
	}
};
