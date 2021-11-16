/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const os = require('os');
const path = require('path');

const findRoot = require('../../src/utils/findRoot');
const getFixturePath = require('../../support/getFixturePath');

const FIXTURES = getFixturePath('utils', 'findRoot');

const MODULES = path.join(FIXTURES, 'modules');

const PUBLIC_PROJECT = path.join(MODULES, 'apps', 'some', 'project');
const PRIVATE_PROJECT = path.join(
	MODULES,
	'private',
	'apps',
	'secret',
	'project'
);

describe('findRoot()', () => {
	let cwd;

	beforeEach(() => {
		cwd = process.cwd();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	it('returns the root from inside "modules/apps/some/project"', () => {
		process.chdir(PUBLIC_PROJECT);
		expect(findRoot()).toEqual(MODULES);
	});

	it('returns the root from inside "modules/private/apps/secret/project"', () => {
		process.chdir(PRIVATE_PROJECT);
		expect(findRoot()).toEqual(MODULES);
	});

	it('returns undefined when there is no yarn.lock', () => {

		// Will pass as long as nobody does a `yarn install` in $TMPDIR.

		process.chdir(os.tmpdir());
		expect(findRoot()).toBe(undefined);
	});

	it('returns undefined when in the wrong repository', () => {

		// For example, in this project, we have a yarn.lock, but this is not
		// liferay-portal.

		expect(findRoot()).toBe(undefined);
	});
});
