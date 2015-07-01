'use strict';

var chai = require('chai');
var fs = require('fs-extra');
var gulp = require('gulp');
var lfrThemeConfig = require('../../lib/liferay_theme_config.js');
var os = require('os');
var path = require('path');

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', 'base-theme');

describe('Liferay theme config', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../assets/base-theme'), tempPath, function (err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._tempPath = tempPath;

			done();
		});
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	it('should get only liferayTheme namespaced properties from package.json if `all` parameter is false', function(done) {
		var themeConfig = lfrThemeConfig.getConfig();

		assert.isDefined(themeConfig.baseTheme);
		assert.isDefined(themeConfig.themeletDependencies);
		assert.isDefined(themeConfig.version);
		assert.isUndefined(themeConfig.liferayTheme);

		var packageJSON = lfrThemeConfig.getConfig(true);

		assert.isDefined(packageJSON.liferayTheme);
		assert.isUndefined(packageJSON.baseTheme);
		assert.deepEqual(packageJSON.liferayTheme, themeConfig);

		done();
	});

	it('should remove dependencies from package.json', function(done) {
		lfrThemeConfig.removeDependencies(['test-themelet']);

		var packageJSON = lfrThemeConfig.getConfig(true);

		assert.isUndefined(packageJSON.dependencies['test-themelet']);
		assert.isDefined(packageJSON.dependencies['gulp']);
		assert.isDefined(packageJSON.dependencies['liferay-theme-tasks']);

		done();
	});

	it('should remove dependencies from package.json', function(done) {
		lfrThemeConfig.removeDependencies(['test-themelet']);

		var packageJSON = lfrThemeConfig.getConfig(true);

		assert.isUndefined(packageJSON.dependencies['test-themelet']);
		assert.isDefined(packageJSON.dependencies['gulp']);
		assert.isDefined(packageJSON.dependencies['liferay-theme-tasks']);

		done();
	});

	it('should replace old themelet dependencies with new dependencies', function(done) {
		lfrThemeConfig.setConfig({
			themeletDependencies: {
				'fake-themelet': {
					liferayTheme: {
						themelet: true,
						version: 7.0
					},
					name: 'test-themelet',
					version: '0.0.0'
				}
			}
		});

		var themeConfig = lfrThemeConfig.getConfig();

		assert.isUndefined(themeConfig.themeletDependencies['test-themelet']);
		assert.isDefined(themeConfig.themeletDependencies['fake-themelet']);

		done();
	});

	it('should add new npm dependencies without removing previously added dependencies', function(done) {
		lfrThemeConfig.setConfig({
			'fake-module': '*'
		}, true);

		var dependencies = lfrThemeConfig.getConfig(true).dependencies;

		assert.isDefined(dependencies['fake-module']);
		assert.isDefined(dependencies['gulp']);
		assert.isDefined(dependencies['liferay-theme-tasks']);

		done();
	});
});
