/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from 'liferay-npm-build-tools-common/lib/file-path';

import {removeWebpackHash} from '../webpack';

describe('removeWebpackHash', () => {
	it('works for files without hash', () => {
		expect(
			removeWebpackHash(
				new FilePath('/home/perico/project/bundle.js', {posix: true})
			)
		).toEqual(
			new FilePath('/home/perico/project/bundle.js', {posix: true})
		);
	});

	it('works for files with hash', () => {
		expect(
			removeWebpackHash(
				new FilePath('/home/perico/project/bundle.CAFEBABE.js', {
					posix: true,
				})
			)
		).toEqual(
			new FilePath('/home/perico/project/bundle.js', {posix: true})
		);
	});

	it('only removes the last hash', () => {
		expect(
			removeWebpackHash(
				new FilePath(
					'/home/perico/project/bundle.FABADA.code.CAFEBABE.js',
					{posix: true}
				)
			)
		).toEqual(
			new FilePath('/home/perico/project/bundle.FABADA.code.js', {
				posix: true,
			})
		);
	});
});
