/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const del = require('del');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const testUtil = require('../../test/util');
const {doctor} = require('../doctor');

const initCwd = process.cwd();
const tempPath = path.join(
	os.tmpdir(),
	'liferay-theme-tasks',
	'doctor-fixtures'
);

beforeEach(() => {
	testUtil.hideConsole();

	fs.copySync(
		path.join(
			__dirname,
			'./fixtures/doctor/_package_outdated_settings.json'
		),
		path.join(tempPath, 'package.json')
	);
	process.chdir(tempPath);
});

afterEach(() => {
	del.sync(path.join(tempPath, '**'), {
		force: true,
	});
	process.chdir(initCwd);

	testUtil.restoreConsole();
});

it('throws appropriate error message', () => {
	const pkgJsonPath = path.join(__dirname, './fixtures/doctor/_package.json');
	// eslint-disable-next-line @liferay/no-dynamic-require
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({
			haltOnMissingDeps: true,
			tasks: [],
			themeConfig: pkgJson,
		})
	).toThrow(new Error('Missing 1 theme dependencies'));
});

it('looks for dependencies regardless if devDependency or not', () => {
	const pkgJsonPath = path.join(
		__dirname,
		'./fixtures/doctor/_package_mixed_dependencies.json'
	);
	// eslint-disable-next-line @liferay/no-dynamic-require
	const pkgJson = require(pkgJsonPath);

	expect(() =>
		doctor({
			haltOnMissingDeps: true,
			tasks: [],
			themeConfig: pkgJson,
		})
	).not.toThrow();
});

it('removes supportCompass', () => {
	const pkgJsonPath = path.join(tempPath, 'package.json');
	// eslint-disable-next-line @liferay/no-dynamic-require
	const pkgJson = require(pkgJsonPath);

	doctor({
		haltOnMissingDeps: true,
		tasks: [],
		themeConfig: pkgJson,
	});

	const updatedPkg = JSON.parse(fs.readFileSync(pkgJsonPath));

	const liferayTheme = updatedPkg.liferayTheme;

	expect(liferayTheme.baseTheme).toBe('styled');
	expect(liferayTheme.version).toBe('7.0');
	expect(liferayTheme.supportCompass).toBeUndefined();
});
