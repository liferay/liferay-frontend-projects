/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const getDXPVersion = require('../../src/utils/getDXPVersion');

describe('getDXPVersion()', () => {
	let cwd;

	beforeEach(() => {
		cwd = process.cwd();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	function getFixture(id) {
		return path.join(
			__dirname,
			'..',
			'..',
			'__fixtures__',
			'utils',
			'getDXPVersion',
			id,
			'modules'
		);
	}

	test.each`
		version  | major | minor | patch
		${'7.4'} | ${7}  | ${4}  | ${0}
		${'7.3'} | ${7}  | ${3}  | ${5}
		${'7.2'} | ${7}  | ${2}  | ${1}
		${'7.1'} | ${7}  | ${1}  | ${2}
	`(
		'returns {major, minor, patch} for $version',
		({major, minor, patch, version}) => {
			const modules = getFixture(version);

			process.chdir(modules);

			// Works from the "modules/"...

			expect(getDXPVersion()).toEqual({major, minor, patch});

			// ... and from specific project directories.

			process.chdir(path.join(modules, 'apps', 'some', 'project'));

			expect(getDXPVersion()).toEqual({major, minor, patch});
		}
	);

	it('returns undefined when there is no release.properties file', () => {
		const modules = getFixture('no-properties');

		process.chdir(modules);

		expect(getDXPVersion()).toBe(undefined);
	});

	it('returns undefined when release.properties contains no release.info.version', () => {
		const modules = getFixture('no-release-info');

		process.chdir(modules);

		expect(getDXPVersion()).toBe(undefined);
	});

	it('returns undefined when the release.info.version is malformed', () => {
		const modules = getFixture('malformed');

		process.chdir(modules);

		expect(getDXPVersion()).toBe(undefined);
	});
});
