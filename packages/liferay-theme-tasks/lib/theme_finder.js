const _ = require('lodash');
const async = require('async');
const globby = require('globby');
const npmKeyword = require('npm-keyword');
const packageJson = require('package-json');
const path = require('path');
const spawn = require('cross-spawn');

const lfrThemeConfig = require('./liferay_theme_config');

const themeConfig = lfrThemeConfig.getConfig();

function getLiferayThemeModule(name, cb) {
	this.getPackageJSON(
		{
			name: name,
		},
		(err, pkg) => {
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
}

function getLiferayThemeModules(config, cb) {
	if (_.isUndefined(cb)) {
		cb = config;

		config = {};
	}

	let globalModules = _.isUndefined(config.globalModules)
		? true
		: config.globalModules;

	config.keyword = config.keyword || 'liferay-theme';

	let searchFn = globalModules ? searchGlobalModules : searchNpm;

	searchFn.call(this, config, cb);
}

module.exports = {getLiferayThemeModule, getLiferayThemeModules};

function findThemeModulesIn(paths) {
	let modules = [];

	_.forEach(paths, rootPath => {
		if (!rootPath) {
			return;
		}

		modules = globby
			.sync(['*-theme', '*-themelet'], {
				cwd: rootPath,
			})
			.map(match => path.join(rootPath, match))
			.concat(modules);
	});

	return modules;
}

function getNpmPaths() {
	let paths = [];

	let win32 = process.platform === 'win32';

	_.forEach(
		path.join(process.cwd(), '..').split(path.sep),
		(part, index, parts) => {
			let lookup = path.join(
				...parts.slice(0, index + 1).concat(['node_modules'])
			);

			if (!win32) {
				lookup = '/' + lookup;
			}

			paths.push(lookup);
		}
	);

	if (process.env.NODE_PATH) {
		paths = _.compact(process.env.NODE_PATH.split(path.delimiter)).concat(
			paths
		);
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
}

function getPackageJSON(theme, cb) {
	packageJson(theme.name, {fullMetadata: true})
		.then(pkg => cb(null, pkg))
		.catch(cb);
}

function isLiferayThemeModule(pkg, themelet) {
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
}

function matchesSearchTerms(pkg, searchTerms) {
	let description = pkg.description;

	return (
		pkg.name.indexOf(searchTerms) > -1 ||
		(description && description.indexOf(searchTerms) > -1)
	);
}

function reduceModuleResults(modules, config) {
	let instance = this;

	let searchTerms = config.searchTerms;
	let themelet = config.themelet;

	return _.reduce(
		modules,
		(result, item) => {
			let valid = false;

			if (instance.isLiferayThemeModule(item, themelet)) {
				valid = true;
			}

			if (searchTerms && valid) {
				valid = instance.matchesSearchTerms(item, searchTerms);
			}

			if (valid) {
				result[item.name] = item;
			}

			return result;
		},
		{}
	);
}

function searchGlobalModules(config, cb) {
	let instance = this;

	let modules = this.findThemeModulesIn(this.getNpmPaths());

	modules = _.reduce(
		modules,
		(result, item) => {
			try {
				let json = require(path.join(item, 'package.json'));

				json.realPath = item;

				result.push(json);
			} catch (err) {}

			return result;
		},
		[]
	);

	cb(instance.reduceModuleResults(modules, config));
}

function searchNpm(config, cb) {
	let instance = this;

	npmKeyword(config.keyword).then(packages => {
		async.map(packages, instance.getPackageJSON, (err, results) => {
			if (err) {
				cb(err);

				return;
			}

			let themeResults = instance.reduceModuleResults(results, config);

			cb(themeResults);
		});
	});
}

// Export private methods when in tests
if (typeof jest !== 'undefined') {
	Object.assign(module.exports, {
		findThemeModulesIn,
		getNpmPaths,
		getPackageJSON,
		isLiferayThemeModule,
		matchesSearchTerms,
		reduceModuleResults,
		searchGlobalModules,
		searchNpm,
	});
}
