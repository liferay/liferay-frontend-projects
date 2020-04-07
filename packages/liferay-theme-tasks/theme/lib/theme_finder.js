/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const async = require('async');
const spawn = require('cross-spawn');
const fs = require('fs');
const globby = require('globby');
const _ = require('lodash');
const npmKeyword = require('npm-keyword');
const os = require('os');
const packageJson = require('package-json');
const path = require('path');
const {URL} = require('url');

const project = require('../../lib/project');

function getLiferayThemeModule(name, cb) {
	getPackageJSON(
		{
			name,
		},
		(err, pkg) => {
			if (pkg && !isLiferayTheme(pkg)) {
				pkg = null;

				err = new Error(
					'Package is not a Liferay theme or themelet module'
				);
			}

			cb(err, pkg);
		}
	);
}

/**
 * Wrapper for spawn.sync that fails on any error.
 */
function run(command, args) {
	const getDescription = () => `${command} ${args.join(' ')}`;

	let error;

	const results = spawn.sync(command, args);

	if (results.error) {
		error = new Error(
			`Command \`${getDescription()}\` encountered an error: ${
				results.error
			}`
		);
	} else if (results.signal) {
		error = new Error(
			`Command \`${getDescription()}\` exited due to signal: ${
				results.signal
			}`
		);
	} else if (results.status) {
		error = new Error(
			`Command \`${getDescription()}\` exited with status: ${
				results.status
			}`
		);
	}

	if (error) {
		if (results.stdout) {
			// eslint-disable-next-line no-console
			console.log(results.stdout.toString());
		}

		if (results.stderr) {
			// eslint-disable-next-line no-console
			console.log(results.stderr.toString());
		}

		throw error;
	}
}

/**
 * Given a package URL, attempts to download it, extract the package.json, and
 * validate it.
 */
function getLiferayThemeModuleFromURL(url) {
	new URL(url);

	let config;

	// Install the package in a temporary directory in order to get
	// the package.json.
	withScratchDirectory(() => {
		run('npm', ['init', '-y']);

		// Ideally, we wouldn't install any dependencies at all, but this is
		// the closest we can get (production only, skipping optional
		// dependencies).
		run('npm', [
			'install',
			'--ignore-scripts',
			'--no-optional',
			'--production',
			url,
		]);

		// Just in case package name doesn't match URL basename, read it.
		const {dependencies} = JSON.parse(fs.readFileSync('package.json'));
		const themeName = Object.keys(dependencies)[0];

		const json = path.join('node_modules', themeName, 'package.json');
		config = JSON.parse(fs.readFileSync(json));
	});

	if (!isLiferayTheme(config)) {
		throw new Error(`URL ${url} is not a liferay-theme`);
	} else {
		return config;
	}
}

function getLiferayThemeModules(config, cb) {
	if (_.isUndefined(cb)) {
		cb = config;

		config = {};
	}

	const globalModules = _.isUndefined(config.globalModules)
		? true
		: config.globalModules;

	config.keyword = config.keyword || 'liferay-theme';

	const searchFn = globalModules ? searchGlobalModules : searchNpm;

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

		const themeConfig = project.themeConfig.config;

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

module.exports = {
	getLiferayThemeModule,
	getLiferayThemeModuleFromURL,
	getLiferayThemeModules,
};

/**
 * Execute `cb()` in the context of a temporary directory.
 *
 * Note that `cb()` should be entirely synchronous, because clean-up is
 * performed as soon as it returns.
 */
function withScratchDirectory(cb) {
	const template = path.join(os.tmpdir(), 'theme-finder-');
	const directory = fs.mkdtempSync(template);

	const cwd = process.cwd();

	try {
		process.chdir(directory);
		cb();
	} finally {
		process.chdir(cwd);
	}
}

function isLiferayTheme(config) {
	return (
		config &&
		config.liferayTheme &&
		config.keywords &&
		config.keywords.indexOf('liferay-theme') !== -1
	);
}

function reportDiscardedModules(moduleResults, outcome, message) {
	if (moduleResults[outcome]) {
		// eslint-disable-next-line no-console
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

	const win32 = process.platform === 'win32';

	_.forEach(
		path.join(project.dir, '..').split(path.sep),
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
		const results = spawn.sync('npm', ['root', '-g']);

		if (!results.error && results.stdout) {
			const npmRoot = results.stdout.toString();

			if (npmRoot) {
				paths.push(_.trim(npmRoot));
			}
		}

		if (win32) {
			paths.push(path.join(process.env.APPDATA, 'npm', 'node_modules'));
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

const LiferayThemeModuleStatus = {
	NO_LIFERAY_THEME: 'NO_LIFERAY_THEME',
	NO_PACKAGE_JSON: 'NO_PACKAGE_JSON',
	OK: 'OK',
	TARGET_VERSION_DOES_NOT_MATCH: 'TARGET_VERSION_DOES_NOT_MATCH',
	THEMELET_FLAG_DOES_NOT_MATCH: 'THEMELET_FLAG_DOES_NOT_MATCH',
};

function getLiferayThemeModuleStatus(pkg, themelet) {
	if (pkg) {
		const liferayTheme = pkg.liferayTheme;

		if (!liferayTheme) {
			return LiferayThemeModuleStatus.NO_LIFERAY_THEME;
		}

		const liferayThemeVersion = liferayTheme.version;
		const themeConfig = project.themeConfig.config;

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
	const description = pkg.description;

	return (
		pkg.name.indexOf(searchTerms) > -1 ||
		(description && description.indexOf(searchTerms) > -1)
	);
}

function reduceModuleResults(modules, config) {
	const searchTerms = config.searchTerms;
	const themelet = config.themelet;

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
				// eslint-disable-next-line liferay/no-dynamic-require
				const json = require(path.join(item, 'package.json'));

				json.__realPath__ = item;

				result.push(json);
			} catch (err) {
				// Swallow.
			}

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
