'use strict';

let chai = require('chai');
let del = require('del');
let fs = require('fs-extra');
let lfrThemeConfig = require('../../lib/liferay_theme_config.js');
let os = require('os');
let path = require('path');
let test = require('ava');

let testUtil = require('../util');

let assert = chai.assert;

chai.use(require('chai-fs'));

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'liferay_theme_config',
		},
		function(config) {
			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'liferay_theme_config');
});

test('getConfig should get only liferayTheme namespaced properties from package.json if `all` parameter is false', function(
	t
) {
	t.plan(0);

	let themeConfig = lfrThemeConfig.getConfig();

	assert.isDefined(themeConfig.baseTheme);
	assert.isDefined(themeConfig.themeletDependencies);
	assert.isDefined(themeConfig.version);
	assert.isUndefined(themeConfig.liferayTheme);

	let packageJSON = lfrThemeConfig.getConfig(true);

	assert.isDefined(packageJSON.liferayTheme);
	assert.isUndefined(packageJSON.baseTheme);
	assert.deepEqual(packageJSON.liferayTheme, themeConfig);
});

test('removeConfig should remove dependencies from package.json', function(t) {
	t.plan(0);

	lfrThemeConfig.removeConfig(['rubySass']);

	let liferayTheme = lfrThemeConfig.getConfig();

	assert.isUndefined(liferayTheme.rubySass);
});

test('removeDependencies should remove dependencies from package.json', function(
	t
) {
	t.plan(0);

	lfrThemeConfig.removeDependencies(['test-themelet']);

	let packageJSON = lfrThemeConfig.getConfig(true);

	assert.isUndefined(packageJSON.dependencies['test-themelet']);
	assert.isDefined(packageJSON.dependencies['gulp']);
	assert.isDefined(packageJSON.dependencies['liferay-theme-tasks']);
});

test('setConfig should replace old themelet dependencies with new dependencies', function(
	t
) {
	t.plan(0);

	lfrThemeConfig.setConfig({
		themeletDependencies: {
			'fake-themelet': {
				liferayTheme: {
					themelet: true,
					version: 7.0,
				},
				name: 'test-themelet',
				version: '0.0.0',
			},
		},
	});

	let themeConfig = lfrThemeConfig.getConfig();

	assert.isUndefined(themeConfig.themeletDependencies['test-themelet']);
	assert.isDefined(themeConfig.themeletDependencies['fake-themelet']);
});

test('setConfig should add new npm dependencies without removing previously added dependencies', function(
	t
) {
	t.plan(0);

	lfrThemeConfig.setDependencies({
		'fake-module': '*',
	});

	let dependencies = lfrThemeConfig.getConfig(true).dependencies;

	assert.isDefined(dependencies['fake-module']);
	assert.isDefined(dependencies['gulp']);
	assert.isDefined(dependencies['liferay-theme-tasks']);
});

test('setConfig should add to devDependencies and leave dependencies alone', function(
	t
) {
	t.plan(0);

	let originalPackageJSON = lfrThemeConfig.getConfig(true);

	let newDependencies = {
		'fake-module': '*',
	};

	lfrThemeConfig.setDependencies(newDependencies, true);

	let packageJSON = lfrThemeConfig.getConfig(true);

	assert.deepEqual(
		originalPackageJSON.dependencies,
		packageJSON.dependencies
	);
	assert.deepEqual(newDependencies, packageJSON.devDependencies);
});
