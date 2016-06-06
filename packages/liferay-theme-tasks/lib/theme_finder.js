'use strict';

var _ = require('lodash');
var async = require('async');
var exec = require('child_process').exec;
var globby = require('globby');
var lfrThemeConfig = require('./liferay_theme_config');
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');
var path = require('path');

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

	_findThemeModulesIn: function(paths) {
		var modules = [];

		_.forEach(paths, function(rootPath) {
			if (!rootPath) {
				return;
			}

			modules = globby.sync([
				'*-theme',
				'*-themelet'
			], {
				cwd: rootPath
			}).map(function(match) {
				return path.join(rootPath, match);
			}).concat(modules);
		});

		return modules;
	},

	_getNpmPaths: function() {
		var paths = [];

		var win32 = process.platform === 'win32';

		path.join(process.cwd(), '..').split(path.sep).forEach(function (part, index, parts) {
			var lookup = path.join.apply(path, parts.slice(0, index + 1).concat(['node_modules']));

			if (!win32) {
				lookup = '/' + lookup;
			}

			paths.push(lookup);
		});

		if (process.env.NODE_PATH) {
			paths = _.compact(process.env.NODE_PATH.split(path.delimiter)).concat(paths);
		}
		else {
			if (win32) {
				paths.push(path.join(process.env.APPDATA, 'npm/node_modules'));
			}
			else {
				paths.push('/usr/lib/node_modules');
				paths.push('/usr/local/lib/node_modules');
			}
		}

		return paths.reverse();
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

	_matchesSearchTerms: function(pkg, searchTerms) {
		var description = pkg.description;

		return pkg.name.indexOf(searchTerms) > -1 || (description && description.indexOf(searchTerms) > -1);
	},

	_reduceModuleResults: function(modules, config) {
		var instance = this;

		var themelet = config.themelet;
		var searchTerms = config.searchTerms;

		return _.reduce(modules, function(result, item, index) {
			var valid = false;

			if (instance._isLiferayThemeModule(item, themelet)) {
				valid = true;
			}

			if (searchTerms && valid) {
				valid = instance._matchesSearchTerms(item, searchTerms);
			}

			if (valid) {
				result[item.name] = item;
			}

			return result;
		}, {});
	},

	_seachGlobalModules: function(config, cb) {
		var instance = this;

		var modules = this._findThemeModulesIn(this._getNpmPaths());

		modules = _.reduce(modules, function(result, item, index) {
			try {
				var json = require(path.join(item, 'package.json'));

				json.realPath = item;

				result.push(json);
			}
			catch(e) {
			}

			return result;
		}, []);

		cb(instance._reduceModuleResults(modules, config));
	},

	_searchNpm: function(config, cb) {
		var instance = this;

		npmKeyword(config.keyword)
			.then(function(packages) {
				async.map(packages, instance._getPackageJSON, function(err, results) {
					if (err) {
						cb(err);

						return;
					}

					var themeResults = instance._reduceModuleResults(results, config);

					cb(themeResults);
				});
			});
	}
};
