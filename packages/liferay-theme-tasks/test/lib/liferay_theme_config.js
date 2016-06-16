'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var lfrThemeConfig = require('../../lib/liferay_theme_config.js');
var os = require('os');
var path = require('path');
var test = require('ava');

var testUtil = require('../util');

var assert = chai.assert;
chai.use(require('chai-fs'));

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'liferay_theme_config'
	}, function(config) {
		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'liferay_theme_config');
});

test('getConfig should get only liferayTheme namespaced properties from package.json if `all` parameter is false', function(t) {
	var themeConfig = lfrThemeConfig.getConfig();

	assert.isDefined(themeConfig.baseTheme);
	assert.isDefined(themeConfig.themeletDependencies);
	assert.isDefined(themeConfig.version);
	assert.isUndefined(themeConfig.liferayTheme);

	var packageJSON = lfrThemeConfig.getConfig(true);

	assert.isDefined(packageJSON.liferayTheme);
	assert.isUndefined(packageJSON.baseTheme);
	assert.deepEqual(packageJSON.liferayTheme, themeConfig);
});

test('removeConfig should remove dependencies from package.json', function(t) {
	lfrThemeConfig.removeConfig(['rubySass']);

	var liferayTheme = lfrThemeConfig.getConfig();

	assert.isUndefined(liferayTheme.rubySass);
});

test('removeDependencies should remove dependencies from package.json', function() {
	lfrThemeConfig.removeDependencies(['test-themelet']);

	var packageJSON = lfrThemeConfig.getConfig(true);

	assert.isUndefined(packageJSON.dependencies['test-themelet']);
	assert.isDefined(packageJSON.dependencies['gulp']);
	assert.isDefined(packageJSON.dependencies['liferay-theme-tasks']);
});

test('setConfig should replace old themelet dependencies with new dependencies', function(t) {
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
});

test('setConfig should add new npm dependencies without removing previously added dependencies', function(t) {
	lfrThemeConfig.setDependencies({
		'fake-module': '*'
	});

	var dependencies = lfrThemeConfig.getConfig(true).dependencies;

	assert.isDefined(dependencies['fake-module']);
	assert.isDefined(dependencies['gulp']);
	assert.isDefined(dependencies['liferay-theme-tasks']);
});

test('setConfig should add to devDependencies and leave dependencies alone', function(t) {
	var originalPackageJSON = lfrThemeConfig.getConfig(true);

	var newDependencies = {
		'fake-module': '*'
	};

	lfrThemeConfig.setDependencies(newDependencies, true);

	var packageJSON = lfrThemeConfig.getConfig(true);

	assert.deepEqual(originalPackageJSON.dependencies, packageJSON.dependencies);
	assert.deepEqual(newDependencies, packageJSON.devDependencies);
});
