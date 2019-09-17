/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {stripSourceDir} from '../rules';

const savedNativeIsPosix = FilePath.nativeIsPosix;
const savedPathSep = path.sep;
const savedProjectPath = project.dir.asNative;

describe('stripSourceDir', () => {
	beforeEach(() => {
		project.loadFrom(path.join(__dirname, '__fixtures__', 'rules-project'));
	});

	afterEach(() => {
		FilePath.nativeIsPosix = savedNativeIsPosix;
		path.sep = savedPathSep;
		project.loadFrom(savedProjectPath);
	});

	it('works with posix paths', () => {
		path.sep = path.posix.sep;
		FilePath.nativeIsPosix = true;

		expect(stripSourceDir('assets/path/to/file.js')).toEqual(
			'path/to/file.js'
		);

		expect(stripSourceDir('src/main/resources/path/to/file.js')).toEqual(
			'path/to/file.js'
		);
	});

	it('works with win32 paths', () => {
		path.sep = path.win32.sep;
		FilePath.nativeIsPosix = false;

		expect(stripSourceDir('assets\\path\\to\\file.js')).toEqual(
			'path\\to\\file.js'
		);

		expect(
			stripSourceDir('src\\main\\resources\\path\\to\\file.js')
		).toEqual('path\\to\\file.js');
	});
});
