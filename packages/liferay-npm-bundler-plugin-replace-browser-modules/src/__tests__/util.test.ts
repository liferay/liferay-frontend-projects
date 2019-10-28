/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {AliasFromType} from 'liferay-npm-build-tools-common/lib/alias';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';

import {UnrolledAliasesMap, unrollAliasesMap} from '../util';

it('unrollAliasesMap works', () => {
	const unrolledAliasesMap = unrollAliasesMap({
		'/home/me/project': {
			fs: false,
			'/log.js': './log-browser.js',
		},
		'/home/me/project/dir': {
			'./file': './browser-file1.js',
			'./file.js': './browser-file2.js',
		},
		'/home/me/project/dir/util': {
			'./random.js': './browser-random.js',
		},
		'/home/me/project/sibling': {
			'../dir/util/random.js': './browser-random.js',
		},
	});

	expect(unrolledAliasesMap).toEqual({
		'/home/me/project/fs.js': [
			{
				absDir: new FilePath('/home/me/project', {posix: true}),
				fromType: AliasFromType.EXTERNAL,
				from: 'fs',
				to: false,
			},
		],
		'/home/me/project/log.js': [
			{
				absDir: new FilePath('/home/me/project', {posix: true}),
				fromType: AliasFromType.LOCAL,
				from: '/log.js',
				to: './log-browser.js',
			},
		],
		'/home/me/project/dir/file.js': [
			{
				absDir: new FilePath('/home/me/project/dir', {posix: true}),
				fromType: AliasFromType.LOCAL,
				from: './file',
				to: './browser-file1.js',
			},
			{
				absDir: new FilePath('/home/me/project/dir', {posix: true}),
				fromType: AliasFromType.LOCAL,
				from: './file.js',
				to: './browser-file2.js',
			},
		],
		'/home/me/project/dir/util/random.js': [
			{
				absDir: new FilePath('/home/me/project/dir/util', {
					posix: true,
				}),
				fromType: AliasFromType.LOCAL,
				from: './random.js',
				to: './browser-random.js',
			},
			{
				absDir: new FilePath('/home/me/project/sibling', {posix: true}),
				fromType: AliasFromType.LOCAL,
				from: '../dir/util/random.js',
				to: './browser-random.js',
			},
		],
	} as UnrolledAliasesMap);
});
