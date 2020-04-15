/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');

const {cleanTempTheme, setupTempTheme} = require('../../../lib/test/util');
const themeFinder = require('../theme_finder.js');

let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		namespace: 'theme_finder',
		themeConfig: {},
		themeName: 'base-theme',
		version: '7.1',
	});
});

afterEach(() => {
	cleanTempTheme(tempTheme);
});

it('getLiferayThemeModule should retrieve package.json file from npm', done => {
	const pkgName = 'lfr-product-menu-animation-themelet';

	themeFinder.getLiferayThemeModule(pkgName, (err, pkg) => {
		expect(_.isNull(err)).toBe(true);
		expect(_.isObject(pkg.liferayTheme)).toBe(true);
		expect(pkg.keywords.indexOf('liferay-theme') > -1).toBe(true);
		expect(pkg.name).toEqual(pkgName);

		done();
	});
});

it('getLiferayThemeModule should return error because module does not exist', done => {
	themeFinder.getLiferayThemeModule('fake-themelet-123', (err, pkg) => {
		expect(_.isUndefined(pkg)).toBe(true);
		expect(err.message).toEqual(
			"Package `fake-themelet-123` doesn't exist"
		);

		done();
	});
});

it('getLiferayThemeModule should return error because module is not a liferay theme module', done => {
	themeFinder.getLiferayThemeModule('generator-liferay-theme', (err, pkg) => {
		expect(_.isNull(pkg)).toBe(true);
		expect(err.message).toEqual(
			'Package is not a Liferay theme or themelet module'
		);

		done();
	});
});

it('getLiferayThemeModules should return an object when searching for global modules', done => {
	themeFinder.getLiferayThemeModules(themeResults => {
		expect(_.isObject(themeResults)).toBe(true);

		done();
	});
});

it.todo(
	'getLiferayThemeModules should return an object when searching for npm modules'
);
