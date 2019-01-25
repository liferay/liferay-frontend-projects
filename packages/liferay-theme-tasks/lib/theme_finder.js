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
	getPackageJSON(
		{
			name: name,
		},
		(err, pkg) => {
			if (
				(pkg && !pkg.liferayTheme) ||
				(pkg && !_.includes(pkg.keywords, 'liferay-theme'))
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

	searchFn.call(this, config, moduleResults => {
		reportDiscardedModules(
			moduleResults,
			LiferayThemeModuleStatus.NO_PACKAGE_JSON,
			'with no package.json'
		);
		reportDiscardedModules(
			moduleResults,
			LiferayThemeModuleStatus.NO_LIFERAY_THEME,
			'with no liferayTheme section in package.json'
		);
		reportDiscardedModules(
			moduleResults,
			LiferayThemeModuleStatus.TARGET_VERSION_DOES_NOT_MATCH,
			`not targeting ${themeConfig.version} version`
		);
		reportDiscardedModules(
			moduleResults,
			LiferayThemeModuleStatus.THEMELET_FLAG_DOES_NOT_MATCH,
			'with mismatching themelet flag'
		);

		cb(moduleResults[LiferayThemeModuleStatus.OK] || []);
	});
}

module.exports = {getLiferayThemeModule, getLiferayThemeModules};

const LiferayThemeModuleStatus = {
	NO_PACKAGE_JSON: 'NO_PACKAGE_JSON',
	NO_LIFERAY_THEME: 'NO_LIFERAY_THEME',
	TARGET_VERSION_DOES_NOT_MATCH: 'TARGET_VERSION_DOES_NOT_MATCH',
	THEMELET_FLAG_DOES_NOT_MATCH: 'THEMELET_FLAG_DOES_NOT_MATCH',
	OK: 'OK',
};

function reportDiscardedModules(moduleResults, outcome, message) {
	if (moduleResults[outcome]) {
		console.log(
			'Warning: found',
			Object.keys(moduleResults[outcome]).length,
			'packages (matching criteria)',
			message
		);
	}
}

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

function getLiferayThemeModuleStatus(pkg, themelet) {
	if (pkg) {
		let liferayTheme = pkg.liferayTheme;

		if (!liferayTheme) {
			return LiferayThemeModuleStatus.NO_LIFERAY_THEME;
		}

		let liferayThemeVersion = liferayTheme.version;

		if (
			_.isArray(liferayThemeVersion) &&
			!_.includes(liferayThemeVersion, themeConfig.version)
		) {
			return LiferayThemeModuleStatus.TARGET_VERSION_DOES_NOT_MATCH;
		}

		if (
			!_.isArray(liferayThemeVersion) &&
			liferayThemeVersion !== '*' &&
			liferayThemeVersion !== themeConfig.version
		) {
			return LiferayThemeModuleStatus.TARGET_VERSION_DOES_NOT_MATCH;
		}

		const liferayThemelet = liferayTheme.themelet || false;

		if (themelet !== liferayThemelet) {
			return LiferayThemeModuleStatus.THEMELET_FLAG_DOES_NOT_MATCH;
		}

		return LiferayThemeModuleStatus.OK;
	}

	return LiferayThemeModuleStatus.NO_PACKAGE_JSON;
}

function matchesSearchTerms(pkg, searchTerms) {
	let description = pkg.description;

	return (
		pkg.name.indexOf(searchTerms) > -1 ||
		(description && description.indexOf(searchTerms) > -1)
	);
}

function reduceModuleResults(modules, config) {
	let searchTerms = config.searchTerms;
	let themelet = config.themelet;

	return _.reduce(
		modules,
		(result, item) => {
			if (searchTerms && !matchesSearchTerms(item, searchTerms)) {
				return result;
			}

			const outcome = getLiferayThemeModuleStatus(item, themelet);

			result[outcome] = result[outcome] || {};
			result[outcome][item.name] = item;

			return result;
		},
		{}
	);
}

function searchGlobalModules(config, cb) {
	let modules = findThemeModulesIn(getNpmPaths());

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

	const moduleResults = reduceModuleResults(modules, config);

	cb(moduleResults);
}

function searchNpm(config, cb) {
	npmKeyword(config.keyword).then(packages => {
		async.map(packages, getPackageJSON, (err, results) => {
			if (err) {
				cb(err);

				return;
			}

			const moduleResults = reduceModuleResults(results, config);

			cb(moduleResults);
		});
	});
}

// Export private methods when in tests
if (typeof jest !== 'undefined') {
	Object.assign(module.exports, {
		findThemeModulesIn,
		getNpmPaths,
		getPackageJSON,
		matchesSearchTerms,
		reduceModuleResults,
		searchGlobalModules,
		searchNpm,
	});
}
