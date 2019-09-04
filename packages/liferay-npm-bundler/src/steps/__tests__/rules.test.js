/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {stripSourceDir} from '../rules';

describe('stripSourceDir', () => {
	let savedPathSep;

	beforeEach(() => {
		// Force project.sources to be loaded
		// eslint-disable-next-line no-unused-vars
		const foo = project.sources;

		project._sources.push(...['assets', 'src/main/resources']);

		savedPathSep = path.sep;
	});

	afterEach(() => {
		project._sources.length = 0;

		path.sep = savedPathSep;
	});

	it('works with posix paths', () => {
		path.sep = path.posix.sep;

		expect(stripSourceDir('assets/path/to/file.js')).toEqual(
			'path/to/file.js'
		);

		expect(stripSourceDir('src/main/resources/path/to/file.js')).toEqual(
			'path/to/file.js'
		);
	});

	it('works with win32 paths', () => {
		path.sep = path.win32.sep;

		expect(stripSourceDir('assets\\path\\to\\file.js')).toEqual(
			'path\\to\\file.js'
		);

		expect(
			stripSourceDir('src\\main\\resources\\path\\to\\file.js')
		).toEqual('path\\to\\file.js');
	});
});
