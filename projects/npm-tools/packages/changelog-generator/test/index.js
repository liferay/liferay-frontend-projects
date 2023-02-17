/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const child_process = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {getVersion} = require('../src');

describe('getVersion()', () => {
	let cwd;
	let project;

	function setPrefix(prefix = 'v') {
		fs.writeFileSync(
			path.join(project, '.yarnrc'),
			`tag-version-prefix="${prefix}"\n`
		);
	}

	function setVersion(version = '1.2.3') {
		fs.writeFileSync(
			path.join(project, 'package.json'),
			JSON.stringify({version})
		);
	}

	beforeEach(() => {
		cwd = process.cwd();

		project = fs.mkdtempSync(path.join(os.tmpdir(), 'project-'));

		process.chdir(project);

		child_process.spawnSync('git', ['init'], {shell: true});

		setPrefix();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	test.each`
		from             | version         | prefix        | expected
		${'2.0.0'}       | ${'major'}      | ${'v'}        | ${'v3.0.0'}
		${'2.1.0'}       | ${'major'}      | ${'v'}        | ${'v3.0.0'}
		${'2.1.4'}       | ${'major'}      | ${'v'}        | ${'v3.0.0'}
		${'2.0.0-pre.0'} | ${'major'}      | ${'v'}        | ${'v2.0.0'}
		${'2.1.0-pre.0'} | ${'major'}      | ${'v'}        | ${'v3.0.0'}
		${'2.1.4-pre.0'} | ${'major'}      | ${'v'}        | ${'v3.0.0'}
		${'1.2.3'}       | ${'major'}      | ${'sample/v'} | ${'sample/v2.0.0'}
		${'2.0.0'}       | ${'minor'}      | ${'v'}        | ${'v2.1.0'}
		${'2.1.0'}       | ${'minor'}      | ${'v'}        | ${'v2.2.0'}
		${'2.1.4'}       | ${'minor'}      | ${'v'}        | ${'v2.2.0'}
		${'2.0.0-pre.0'} | ${'minor'}      | ${'v'}        | ${'v2.0.0'}
		${'2.1.0-pre.0'} | ${'minor'}      | ${'v'}        | ${'v2.1.0'}
		${'2.1.4-pre.0'} | ${'minor'}      | ${'v'}        | ${'v2.2.0'}
		${'1.2.3'}       | ${'minor'}      | ${'sample/v'} | ${'sample/v1.3.0'}
		${'2.0.0'}       | ${'patch'}      | ${'v'}        | ${'v2.0.1'}
		${'2.1.0'}       | ${'patch'}      | ${'v'}        | ${'v2.1.1'}
		${'2.1.4'}       | ${'patch'}      | ${'v'}        | ${'v2.1.5'}
		${'2.0.0-pre.0'} | ${'patch'}      | ${'v'}        | ${'v2.0.0'}
		${'2.1.0-pre.0'} | ${'patch'}      | ${'v'}        | ${'v2.1.0'}
		${'2.1.4-pre.0'} | ${'patch'}      | ${'v'}        | ${'v2.1.4'}
		${'1.2.3'}       | ${'patch'}      | ${'sample/v'} | ${'sample/v1.2.4'}
		${'2.0.0'}       | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'2.1.0'}       | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'2.1.4'}       | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'2.0.0-pre.0'} | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'2.1.0-pre.0'} | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'2.1.4-pre.0'} | ${'premajor'}   | ${'v'}        | ${'v3.0.0-pre.0'}
		${'1.2.3'}       | ${'premajor'}   | ${'sample/v'} | ${'sample/v2.0.0-pre.0'}
		${'2.0.0'}       | ${'preminor'}   | ${'v'}        | ${'v2.1.0-pre.0'}
		${'2.1.0'}       | ${'preminor'}   | ${'v'}        | ${'v2.2.0-pre.0'}
		${'2.1.4'}       | ${'preminor'}   | ${'v'}        | ${'v2.2.0-pre.0'}
		${'2.0.0-pre.0'} | ${'preminor'}   | ${'v'}        | ${'v2.1.0-pre.0'}
		${'2.1.0-pre.0'} | ${'preminor'}   | ${'v'}        | ${'v2.2.0-pre.0'}
		${'2.1.4-pre.0'} | ${'preminor'}   | ${'v'}        | ${'v2.2.0-pre.0'}
		${'1.2.3'}       | ${'preminor'}   | ${'sample/v'} | ${'sample/v1.3.0-pre.0'}
		${'2.0.0'}       | ${'prepatch'}   | ${'v'}        | ${'v2.0.1-pre.0'}
		${'2.1.0'}       | ${'prepatch'}   | ${'v'}        | ${'v2.1.1-pre.0'}
		${'2.1.4'}       | ${'prepatch'}   | ${'v'}        | ${'v2.1.5-pre.0'}
		${'2.0.0-pre.0'} | ${'prepatch'}   | ${'v'}        | ${'v2.0.1-pre.0'}
		${'2.1.0-pre.0'} | ${'prepatch'}   | ${'v'}        | ${'v2.1.1-pre.0'}
		${'2.1.4-pre.0'} | ${'prepatch'}   | ${'v'}        | ${'v2.1.5-pre.0'}
		${'1.2.3'}       | ${'prepatch'}   | ${'sample/v'} | ${'sample/v1.2.4-pre.0'}
		${'2.0.0'}       | ${'prerelease'} | ${'v'}        | ${'v2.0.1-pre.0'}
		${'2.1.0'}       | ${'prerelease'} | ${'v'}        | ${'v2.1.1-pre.0'}
		${'2.1.4'}       | ${'prerelease'} | ${'v'}        | ${'v2.1.5-pre.0'}
		${'2.0.0-pre.0'} | ${'prerelease'} | ${'v'}        | ${'v2.0.0-pre.1'}
		${'2.1.0-pre.0'} | ${'prerelease'} | ${'v'}        | ${'v2.1.0-pre.1'}
		${'2.1.4-pre.0'} | ${'prerelease'} | ${'v'}        | ${'v2.1.4-pre.1'}
		${'1.2.3'}       | ${'prerelease'} | ${'sample/v'} | ${'sample/v1.2.4-pre.0'}
		${'1.2.3'}       | ${'10.11.12'}   | ${'v'}        | ${'10.11.12'}
		${'1.2.3'}       | ${'10.11.12'}   | ${'v'}        | ${'10.11.12'}
		${'1.2.3'}       | ${'v10.11.12'}  | ${'v'}        | ${'v10.11.12'}
		${'1.2.3'}       | ${'10.11.12'}   | ${'sample/v'} | ${'10.11.12'}
		${'1.2.3'}       | ${'10.11.12'}   | ${'sample/v'} | ${'10.11.12'}
		${'1.2.3'}       | ${'v10.11.12'}  | ${'sample/v'} | ${'v10.11.12'}
	`(
		'from "$from" with version "$version" and prefix "$prefix" returns "$expected"',
		async ({expected, from, prefix, version}) => {
			setPrefix(prefix);

			setVersion(from);

			expect(await getVersion({version})).toBe(expected);
		}
	);

	test.each`
		from            | version
		${'100.0-cool'} | ${'major'}
		${'100.0-cool'} | ${'minor'}
		${'100.0-cool'} | ${'patch'}
		${'100.0-cool'} | ${'premajor'}
		${'100.0-cool'} | ${'preminor'}
		${'100.0-cool'} | ${'prepatch'}
		${'100.0-cool'} | ${'prerelease'}
	`(
		'throws given version "$version" and a malformed package.json',
		({from, version}) => {
			setVersion(from);

			return expect(() => getVersion({version})).rejects.toThrow(
				/Unable to extract version/
			);
		}
	);

	it('ignores a malformed package.json when a concrete version is supplied', async () => {
		setVersion('100.0-cool');

		expect(await getVersion({version: '10.11.12'})).toBe('10.11.12');
	});
});
