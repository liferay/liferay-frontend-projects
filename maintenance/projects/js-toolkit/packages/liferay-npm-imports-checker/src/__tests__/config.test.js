/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

let cfg;

beforeEach(() => {
	const savedDir = process.cwd();

	try {

		// Load config after chdir to avoid failure the first time it is loaded if
		// an incorrect directory is used

		const testDir = path.join(
			__dirname,
			'__fixtures__',
			'modules',
			'a-project'
		);

		process.chdir(testDir);
		cfg = require('../config');
		cfg.reloadConfig();
	}
	finally {
		process.chdir(savedDir);
	}
});

it('getProjectRootPath() works', () => {
	expect(cfg.getProjectRootPath()).toEqual(
		path.resolve(path.join(__dirname, '__fixtures__'))
	);
});

it('getRunPath() works', () => {
	expect(cfg.getRunPath()).toEqual(
		path.resolve(
			path.join(__dirname, '__fixtures__', 'modules', 'a-project')
		)
	);
});

it('getFolderExclusions() works', () => {
	expect(cfg.getFolderExclusions()).toEqual([
		'!**/build/**',
		'!**/classes/**',
		'!**/node_modules/**',
	]);
});

it('isIgnored() works', () => {
	expect(cfg.isIgnored('a-project', 'a-provider', 'a-package')).toBe(true);
	expect(cfg.isIgnored('a-project', 'a-provider', 'b-package')).toBe(true);
	expect(cfg.isIgnored('a-project', 'b-provider', '*')).toBe(true);

	expect(cfg.isIgnored('o-project', 'o-provider', 'o-package')).toBe(true);

	expect(cfg.isIgnored('a-project', 'b-provider', 'a-package')).toBe(false);
	expect(cfg.isIgnored('b-project', 'b-provider', 'b-package')).toBe(false);
	expect(cfg.isIgnored('a-project', 'a-provider', '*')).toBe(false);
});
