'use strict';

let _ = require('lodash');
let async = require('async');
let globby = require('globby');
let npmKeyword = require('npm-keyword');
let packageJson = require('package-json');
let path = require('path');
let spawn = require('cross-spawn');

let lfrThemeConfig = require('./liferay_theme_config');

let themeConfig = lfrThemeConfig.getConfig();

module.exports = {
	getLiferayThemeModule: function(name, cb) {
		this._getPackageJSON(
			{
				name: name,
			},
			function(err, pkg) {
				if (
					(pkg && !pkg.liferayTheme) ||
					(pkg && !_.contains(pkg.keywords, 'liferay-theme'))
				) {
					pkg = null;

					err = new Error(
						'Package is not a Liferay theme or themelet module'
					);
				}

				cb(err, pkg);
			}
		);
	},

	getLiferayThemeModules: function(config, cb) {
		if (_.isUndefined(cb)) {
			cb = config;

			config = {};
		}

		let globalModules = _.isUndefined(config.globalModules)
			? true
			: config.globalModules;

		config.keyword = config.keyword || 'liferay-theme';

		let searchFn = globalModules
			? this._seachGlobalModules
			: this._searchNpm;

		searchFn.call(this, config, cb);
	},

	_findThemeModulesIn: function(paths) {
		let modules = [];

		_.forEach(paths, function(rootPath) {
			if (!rootPath) {
				return;
			}

			modules = globby
				.sync(['*-theme', '*-themelet'], {
					cwd: rootPath,
				})
				.map(function(match) {
					return path.join(rootPath, match);
				})
				.concat(modules);
		});

		return modules;
	},

	_getNpmPaths: function() {
		let paths = [];

		let win32 = process.platform === 'win32';

		_.forEach(path.join(process.cwd(), '..').split(path.sep), function(
			part,
			index,
			parts
		) {
			let lookup = path.join(
				...parts.slice(0, index + 1).concat(['node_modules'])
			);

			if (!win32) {
				lookup = '/' + lookup;
			}

			paths.push(lookup);
		});

		if (process.env.NODE_PATH) {
			paths = _.compact(
				process.env.NODE_PATH.split(path.delimiter)
			).concat(paths);
		} else {
			let results = spawn.sync('npm', ['root', '-g']);

			if (!results.error && results.stdout) {
				let npmRoot = results.stdout.toString();

				if (npmRoot) {
					paths.push(_.trim(npmRoot));
				}
			}

			if (win32) {
				paths.push(path.join(process.env.APPDATA, 'npm/node_modules'));
			} else {
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
		let retVal = false;

		if (pkg) {
			let liferayTheme = pkg.liferayTheme;

			if (!liferayTheme) {
				return retVal;
			}

			let liferayThemeVersion = liferayTheme.version;

			if (
				_.isArray(liferayThemeVersion) &&
				!_.contains(liferayThemeVersion, themeConfig.version)
			) {
				return retVal;
			} else if (
				!_.isArray(liferayThemeVersion) &&
				liferayThemeVersion !== '*' &&
				liferayThemeVersion !== themeConfig.version
			) {
				return retVal;
			}

			retVal =
				liferayTheme &&
				(themelet ? liferayTheme.themelet : !liferayTheme.themelet);
		}

		return retVal;
	},

	_matchesSearchTerms: function(pkg, searchTerms) {
		let description = pkg.description;

		return (
			pkg.name.indexOf(searchTerms) > -1 ||
			(description && description.indexOf(searchTerms) > -1)
		);
	},

	_reduceModuleResults: function(modules, config) {
		let instance = this;

		let searchTerms = config.searchTerms;
		let themelet = config.themelet;

		return _.reduce(
			modules,
			function(result, item) {
				let valid = false;

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
			},
			{}
		);
	},

	_seachGlobalModules: function(config, cb) {
		let instance = this;

		let modules = this._findThemeModulesIn(this._getNpmPaths());

		modules = _.reduce(
			modules,
			function(result, item) {
				try {
					let json = require(path.join(item, 'package.json'));

					json.realPath = item;

					result.push(json);
				} catch (err) {}

				return result;
			},
			[]
		);

		cb(instance._reduceModuleResults(modules, config));
	},

	_searchNpm: function(config, cb) {
		let instance = this;

		npmKeyword(config.keyword).then(function(packages) {
			async.map(packages, instance._getPackageJSON, function(
				err,
				results
			) {
				if (err) {
					cb(err);

					return;
				}

				let themeResults = instance._reduceModuleResults(
					results,
					config
				);

				cb(themeResults);
			});
		});
	},
};
