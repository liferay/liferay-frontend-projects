'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var gutil = require('gulp-util');
var path = require('path');
var resolve = require('resolve');

var lfrThemeConfig = require('./liferay_theme_config');

var chalk = gutil.colors;

var themeConfig = lfrThemeConfig.getConfig();

var fullDeploy = (argv.full || argv.f);

var CUSTOM_DEP_PATH_ENV_VARIABLE_MAP = {
	'liferay-frontend-common-css': 'LIFERAY_COMMON_CSS_PATH',
	'liferay-frontend-theme-styled': 'LIFERAY_THEME_STYLED_PATH',
	'liferay-frontend-theme-unstyled': 'LIFERAY_THEME_UNSTYLED_PATH'
};

var CUSTOM_DEP_PATH_FLAG_MAP = {
	'liferay-frontend-common-css': 'css-common-path',
	'liferay-frontend-theme-styled': 'styled-path',
	'liferay-frontend-theme-unstyled': 'unstyled-path'
};

module.exports = {
	getCssSrcPath: function(srcPath, config) {
		if (config.version !== '6.2') {
			return srcPath;
		}

		var changedFile = config.changedFile;

		var changed = (changedFile && (changedFile.type === 'changed'));

		var fastDeploy = (!fullDeploy && config.deployed);

		if (changed && fastDeploy) {
			var filePath = changedFile.path;

			var fileDirname = path.dirname(filePath);
			var fileName = path.basename(filePath, '.css');

			if (path.basename(fileDirname) !== 'css' || this.isSassPartial(fileName)) {
				return srcPath;
			}

			srcPath = path.join(srcPath, '..', fileName + '.scss');
		}

		return srcPath;
	},

	getLanguageProperties: function(pathBuild) {
		var pathContent = path.join(pathBuild, 'WEB-INF/src/content');

		var languageKeys = [];

		if (fs.existsSync(pathContent) && fs.statSync(pathContent).isDirectory()) {
			var contentFiles = fs.readdirSync(pathContent);

			_.forEach(
				contentFiles,
				function(item) {
					if (item.match(/Language.*properties/)) {
						var xmlElement = '<language-properties>content/' + item + '</language-properties>';

						languageKeys.push(xmlElement);
					}
				}
			);
		}

		return languageKeys;
	},

	isCssFile: function(name) {
		return _.endsWith(name, '.css') || _.endsWith(name, '.scss');
	},

	isSassPartial: function(name) {
		return _.startsWith(path.basename(name), '_');
	},

	requireDependency: function(dependency, version) {
		var depsPath = this._getDepsPath(version);

		var dependencyPath = resolve.sync(dependency, {
			basedir: depsPath
		});

		return require(dependencyPath);
	},

	resolveDependency: function(dependency, version, dirname) {
		if (_.isUndefined(dirname)) {
			dirname = true;
		}

		var customPath = this._getCustomDependencyPath(dependency);

		if (customPath) {
			gutil.log(chalk.magenta(dependency), 'using custom path:', chalk.magenta(customPath));

			return customPath;
		}

		var depsPath = this._getDepsPath(version);

		var dependencyPath = resolve.sync(dependency, {
			basedir: depsPath
		});

		var resolvedPath = require.resolve(dependencyPath);

		if (dirname) {
			resolvedPath = path.dirname(resolvedPath);
		}

		return resolvedPath;
	},

	_getCustomDependencyPath: function(dependency) {
		var customPath;
		var envVariable = CUSTOM_DEP_PATH_ENV_VARIABLE_MAP[dependency];
		var flag = CUSTOM_DEP_PATH_FLAG_MAP[dependency];

		if (flag && argv[flag]) {
			customPath = argv[flag];
		}
		else if (envVariable && process.env[envVariable]) {
			customPath = process.env[envVariable];
		}

		this._validateCustomDependencyPath(customPath);

		return customPath;
	},

	_getDepsPath: function(version) {
		var depModuleName = 'liferay-theme-deps-7.0';

		version = version || themeConfig.version;

		if (version && version === '6.2') {
			depModuleName = 'liferay-theme-deps-6.2';
		}

		var depsPath = path.dirname(require.resolve(depModuleName));

		return depsPath;
	},

	_validateCustomDependencyPath: function(customPath) {
		if (customPath) {
			try {
				var stats = fs.statSync(customPath);

				if (!stats.isDirectory()) {
					throw new Error(customPath + ' is not a directory');
				}
			}
			catch (err) {
				throw err;
			}
		}
	}
};
