'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var lfrThemeConfig = require('./liferay_theme_config');
var path = require('path');
var resolve = require('resolve');

var themeConfig = lfrThemeConfig.getConfig();

var fullDeploy = (argv.full || argv.f);

module.exports = {
	getCssSrcPath: function(srcPath, config) {
		if (config.version != '6.2') {
			return srcPath;
		}

		var changedFile = config.changedFile;

		var changed = (changedFile && (changedFile.type == 'changed'));

		var fastDeploy = (!fullDeploy && config.deployed);

		if (changed && fastDeploy) {
			var filePath = changedFile.path;

			var fileDirname = path.dirname(filePath);
			var fileName = path.basename(filePath, '.css');

			if (path.basename(fileDirname) != 'css' || this.isSassPartial(fileName)) {
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
				function(item, index) {
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

	resolveDependency: function(dependency, version, dirname) {
		if (_.isUndefined(dirname)) {
			dirname = true;
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

	requireDependency: function(dependency, version) {
		var depsPath = this._getDepsPath(version);

		var dependencyPath = resolve.sync(dependency, {
			basedir: depsPath
		});

		return require(dependencyPath);
	},

	_getDepsPath: function(version) {
		var depModuleName = 'liferay-theme-deps-7.0';

		if ((version && version == '6.2') || (themeConfig && themeConfig.version == '6.2')) {
			depModuleName = 'liferay-theme-deps-6.2';
		}

		var depsPath = path.dirname(require.resolve(depModuleName));

		return depsPath;
	}
};