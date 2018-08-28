const del = require('del');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const lfrThemeConfig = require('../liferay_theme_config.js');
const testUtil = require('../../test/util');

const initCwd = process.cwd();

beforeEach(() => {
	testUtil.copyTempTheme({
		namespace: 'liferay_theme_config',
	});
});

afterEach(() => {
	testUtil.cleanTempTheme(
		'base-theme',
		'7.0',
		'liferay_theme_config',
		initCwd
	);
});

it('getConfig should get only liferayTheme namespaced properties from package.json if `all` parameter is false', () => {
	const themeConfig = lfrThemeConfig.getConfig(false);

	expect(themeConfig).toHaveProperty('baseTheme');
	expect(themeConfig).toHaveProperty('themeletDependencies');
	expect(themeConfig).toHaveProperty('version');
	expect(themeConfig).not.toHaveProperty('liferayTheme');

	const packageJSON = lfrThemeConfig.getConfig(true);

	expect(packageJSON).not.toHaveProperty('baseTheme');
	expect(packageJSON).toHaveProperty('liferayTheme');
	expect(packageJSON.liferayTheme).toEqual(themeConfig);
});

it('removeConfig should remove dependencies from package.json', () => {
	lfrThemeConfig.removeConfig(['rubySass']);

	const liferayTheme = lfrThemeConfig.getConfig();

	expect(liferayTheme).not.toHaveProperty('rubySass');
});

it('removeDependencies should remove dependencies from package.json', () => {
	lfrThemeConfig.removeDependencies(['test-themelet']);

	const packageJSON = lfrThemeConfig.getConfig(true);

	expect(packageJSON.dependencies).not.toHaveProperty('test-themelet');
	expect(packageJSON.dependencies).toHaveProperty('gulp');
	expect(packageJSON.dependencies).toHaveProperty('liferay-theme-tasks');
});

it('setConfig should replace old themelet dependencies with new dependencies', () => {
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

	const themeConfig = lfrThemeConfig.getConfig();

	expect(themeConfig.themeletDependencies).not.toHaveProperty(
		'test-themelet'
	);
	expect(themeConfig.themeletDependencies).toHaveProperty('fake-themelet');
});

it('setConfig should add new npm dependencies without removing previously added dependencies', () => {
	lfrThemeConfig.setDependencies({
		'fake-module': '*',
	});

	const dependencies = lfrThemeConfig.getConfig(true).dependencies;

	expect(dependencies).toHaveProperty('fake-module');
	expect(dependencies).toHaveProperty('gulp');
	expect(dependencies).toHaveProperty('liferay-theme-tasks');
});

it('setConfig should add to devDependencies and leave dependencies alone', () => {
	const originalPackageJSON = lfrThemeConfig.getConfig(true);

	const newDependencies = {
		'fake-module': '*',
	};

	lfrThemeConfig.setDependencies(newDependencies, true);

	const packageJSON = lfrThemeConfig.getConfig(true);

	expect(originalPackageJSON.dependencies).toEqual(packageJSON.dependencies);
	expect(newDependencies).toEqual(packageJSON.devDependencies);
});
