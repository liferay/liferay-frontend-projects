'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs-extra');
var globby = require('globby');
var npmKeyword = require('npm-keyword');
var packageJson = require('package-json');
var path = require('path');
var spawn = require('cross-spawn');

var themeFinder = function() {};

/**
 * themeFinder.find
 * 
 * config {object}
 * 
 *  all {boolean} default=false: if set to true themeFinder will look for both themelets and themes (this functionality does not currently exist)
 *  global {boolean} default=false: if set to true themeFinder will find modules installed globally on your machine
 *  keyword {string} default='liferay-theme': keyword used for searching npm registry
 *  searchTerms {string} default=null: additional search terms for filtering results
 *  themelet {boolean} defualt=false: if set to true themeFinder will return themelet modules instead of theme. Has no affect if `all` is set to true
 * 
 * cb {function}: receives two arguments
 * 
 *  err: if everything was successful it will be null
 *  results: array of package.json objects
 */
themeFinder.find(config, function(err, results) {
	if (_.isUndefined(cb)) {
		cb = config;

		config = {};
	}

	var globalModules = _.isUndefined(config.globalModules) ? true : config.globalModules;

	config.keyword = config.keyword || 'liferay-theme';

	var searchFn = globalModules ? this._seachGlobalModules : this._searchNpm;

	searchFn.call(this, config, cb);
});

/**
 * themeFinder.name
 * 
 * name {string} default=null: name of npm module
 * cb {function}: receives two arguments
 * 
 *  err: if everything was successful it will be null
 *  result: package.json file npm module
 */
themeFinder.name(name, function(err, results) {
	this._getPackageJSON({
		name: name
	}, function(err, pkg) {
		if ((pkg && !pkg.liferayTheme) || (pkg && !_.contains(pkg.keywords, 'liferay-theme'))) {
			pkg = null;

			err = new Error('Package is not a Liferay theme or themelet module');
		}

		cb(err, pkg);
	});
});

function _findThemeModulesIn(paths) {
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
}

function _getLiferayThemeConfig() {
	var packageJSONContent = fs.readFileSync(path.join(process.cwd(), 'package.json'), {
		encoding: 'utf8'
	});

	var packageJSON = JSON.parse(packageJSONContent);

	return packageJSON.liferayTheme;
}

function _getNpmPaths() {
	var paths = [];

	var win32 = process.platform === 'win32';

	_.forEach(path.join(process.cwd(), '..').split(path.sep), function(part, index, parts) {
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
		var results = spawn.sync('npm', ['root', '-g']);

		if (!results.error && results.stdout) {
			var npmRoot = results.stdout.toString();

			if (npmRoot) {
				paths.push(_.trim(npmRoot));
			}
		}

		if (win32) {
			paths.push(path.join(process.env.APPDATA, 'npm/node_modules'));
		}
		else {
			paths.push('/usr/lib/node_modules');
			paths.push('/usr/local/lib/node_modules');
		}
	}

	return paths.reverse();
}

function _getPackageJSON(theme, cb) {
	packageJson(theme.name, '*', function(err, pkg) {
		if (err) {
			cb(err);

			return;
		}

		cb(null, pkg);
	});
}

function _isLiferayThemeModule(pkg, themelet) {
	var retVal = false;
	var themeConfig = _getLiferayThemeConfig();

	if (pkg) {
		var liferayTheme = pkg.liferayTheme;

		if (!liferayTheme) {
			return retVal;
		}

		var liferayThemeVersion = liferayTheme.version;

		if (_.isArray(liferayThemeVersion) && !_.contains(liferayThemeVersion, themeConfig.version)) {
			return retVal;
		}
		else if (!_.isArray(liferayThemeVersion) && (liferayThemeVersion !== '*') && (liferayThemeVersion !== themeConfig.version)) {
			return retVal;
		}

		retVal = liferayTheme && (themelet ? liferayTheme.themelet : !liferayTheme.themelet);
	}

	return retVal;
},

function _matchesSearchTerms(pkg, searchTerms) {
	var description = pkg.description;

	return pkg.name.indexOf(searchTerms) > -1 || (description && description.indexOf(searchTerms) > -1);
}

function _reduceModuleResults(modules, config) {
	var instance = this;

	var searchTerms = config.searchTerms;
	var themelet = config.themelet;

	return _.reduce(modules, function(result, item) {
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
}

function _seachGlobalModules(config, cb) {
	var instance = this;

	var modules = this._findThemeModulesIn(this._getNpmPaths());

	modules = _.reduce(modules, function(result, item) {
		try {
			var json = require(path.join(item, 'package.json'));

			json.realPath = item;

			result.push(json);
		}
		catch (err) {
		}

		return result;
	}, []);

	cb(instance._reduceModuleResults(modules, config));
}

function _searchNpm(config, cb) {
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

module.exports = themeFinder;
