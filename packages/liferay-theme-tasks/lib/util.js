'use strict';

let _ = require('lodash');
let argv = require('minimist')(process.argv.slice(2));
let fs = require('fs-extra');
let gutil = require('gulp-util');
let path = require('path');
let resolve = require('resolve');

let divert = require('./divert');
let lfrThemeConfig = require('./liferay_theme_config');

let chalk = gutil.colors;

let pkg = lfrThemeConfig.getConfig(true);

let themeConfig = pkg.liferayTheme;

let fullDeploy = argv.full || argv.f;

let CUSTOM_DEP_PATH_ENV_VARIABLE_MAP = {
	'liferay-frontend-common-css': 'LIFERAY_COMMON_CSS_PATH',
	'liferay-frontend-theme-styled': 'LIFERAY_THEME_STYLED_PATH',
	'liferay-frontend-theme-unstyled': 'LIFERAY_THEME_UNSTYLED_PATH',
};

let CUSTOM_DEP_PATH_FLAG_MAP = {
	'liferay-frontend-common-css': 'css-common-path',
	'liferay-frontend-theme-styled': 'styled-path',
	'liferay-frontend-theme-unstyled': 'unstyled-path',
};

module.exports = {
	getCssSrcPath: (srcPath, config) =>
		divert('util_helpers', config.version).getCssSrcPath(srcPath, config),

	getLanguageProperties: function(pathBuild) {
		let pathContent = path.join(pathBuild, 'WEB-INF/src/content');

		let languageKeys = [];

		if (
			fs.existsSync(pathContent) &&
			fs.statSync(pathContent).isDirectory()
		) {
			let contentFiles = fs.readdirSync(pathContent);

			_.forEach(contentFiles, function(item) {
				if (item.match(/Language.*properties/)) {
					let xmlElement =
						'<language-properties>content/' +
						item +
						'</language-properties>';

					languageKeys.push(xmlElement);
				}
			});
		}

		return languageKeys;
	},

	isCssFile: function(name) {
		return _.endsWith(name, '.css') || _.endsWith(name, '.scss');
	},

	isSassPartial: divert('util_helpers').isSassPartial,

	requireDependency: function(dependency, version) {
		let depsPath = this._getDepsPath(pkg, dependency, version);

		let dependencyPath = resolve.sync(dependency, {
			basedir: depsPath,
		});

		return require(dependencyPath);
	},

	resolveDependency: function(dependency, version, dirname) {
		if (_.isUndefined(dirname)) {
			dirname = true;
		}

		let customPath = this._getCustomDependencyPath(dependency);

		if (customPath) {
			gutil.log(
				chalk.magenta(dependency),
				'using custom path:',
				chalk.magenta(customPath)
			);

			return customPath;
		}

		let depsPath = this._getDepsPath(pkg, dependency, version);

		let dependencyPath = resolve.sync(dependency, {
			basedir: depsPath,
		});

		let resolvedPath = require.resolve(dependencyPath);

		if (dirname) {
			resolvedPath = path.dirname(resolvedPath);
		}

		return resolvedPath;
	},

	_getCustomDependencyPath: function(dependency) {
		let customPath;
		let envVariable = CUSTOM_DEP_PATH_ENV_VARIABLE_MAP[dependency];
		let flag = CUSTOM_DEP_PATH_FLAG_MAP[dependency];

		if (flag && argv[flag]) {
			customPath = argv[flag];
		} else if (envVariable && process.env[envVariable]) {
			customPath = process.env[envVariable];
		}

		if (customPath) {
			this._validateCustomDependencyPath(customPath);
		}

		return customPath;
	},

	_getDepsPath: function(pkg, dependency, version) {
		if (this._hasDependency(pkg, dependency)) {
			return process.cwd();
		}

		version = version || themeConfig.version;

		let depModuleName = divert('util_helpers', version).depModuleName;

		let depsPath = path.dirname(require.resolve(depModuleName));

		return depsPath;
	},

	_hasDependency: function(pkg, dependency) {
		let themeDependencies = _.assign(
			{},
			pkg.dependencies,
			pkg.devDependencies
		);

		return themeDependencies[dependency];
	},

	_validateCustomDependencyPath: function(customPath) {
		let stats = fs.statSync(customPath);

		if (!stats.isDirectory()) {
			throw new Error(customPath + ' is not a directory');
		}
	},
};
