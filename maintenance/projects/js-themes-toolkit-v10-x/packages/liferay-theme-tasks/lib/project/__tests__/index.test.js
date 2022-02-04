/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs-extra');
const path = require('path');

const project = require('../index');

const prjPath = path.join(__dirname, 'fixtures', 'a-project');
const pkgJsonPath = path.join(prjPath, 'package.json');

const savedCwd = process.cwd();
const savedPkgJson = fs.readJSONSync(pkgJsonPath);

beforeEach(() => {
	process.chdir(prjPath);
	project._reload();
});

afterEach(() => {
	fs.writeJSONSync(pkgJsonPath, savedPkgJson, {spaces: '\t'});
	process.chdir(savedCwd);
});

it('removeDependencies should remove dependencies from package.json', () => {
	project.removeDependencies(['test-themelet']);

	const {pkgJson} = project;

	expect(pkgJson.dependencies).not.toHaveProperty('test-themelet');
	expect(pkgJson.dependencies).toHaveProperty('gulp');
	expect(pkgJson.dependencies).toHaveProperty('liferay-theme-tasks');
});

it('setDependencies should add new npm dependencies without removing previously added dependencies', () => {
	project.setDependencies({
		'fake-module': '*',
	});

	const {dependencies} = project.pkgJson;

	expect(dependencies).toHaveProperty('fake-module');
	expect(dependencies).toHaveProperty('gulp');
	expect(dependencies).toHaveProperty('liferay-theme-tasks');
});

it('setDependencies should add to devDependencies and leave dependencies alone', () => {
	const {pkgJson} = project;

	const newDependencies = {
		'fake-module': '*',
	};

	project.setDependencies(newDependencies, true);

	const {pkgJson: newPkgJson} = project;

	expect(pkgJson.dependencies).toEqual(newPkgJson.dependencies);
	expect(newDependencies).toEqual(newPkgJson.devDependencies);
});
