/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {AliasFromType} from 'liferay-npm-build-tools-common/lib/alias';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

import {reportAndResolveCollisions} from '../index';
import {UnrolledAliasesMap} from '../util';

describe('reportAndResolveCollisions', () => {
	const absRootDir = new FilePath('/home/me/project');
	let log;

	beforeEach(() => {
		log = new PluginLogger();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('aliases out of ancestry line are removed', () => {
		const unrolledAliasMap: UnrolledAliasesMap = {
			'/home/me/project/dir/util/random.js': [
				{
					absDir: new FilePath('/home/me/project/sibling', {
						posix: true,
					}),
					fromType: AliasFromType.LOCAL,
					from: '../dir/util/random.js',
					to: './browser-random3.js',
				},
			],
		};

		reportAndResolveCollisions(log, absRootDir, unrolledAliasMap);

		expect(unrolledAliasMap).toEqual({});

		expect(log.messages).toEqual([]);
	});

	it('external aliases are removed when local module exists', () => {
		const unrolledAliasMap: UnrolledAliasesMap = {
			'/home/me/project/random.js': [
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.EXTERNAL,
					from: 'random',
					to: './browser-random.js',
				},
			],
		};

		jest.spyOn(fs, 'statSync').mockReturnValue({
			isFile: () => true,
		});

		reportAndResolveCollisions(log, absRootDir, unrolledAliasMap);

		expect(unrolledAliasMap).toEqual({});

		expect(log.messages).toEqual([
			{
				level: 'warn',
				link:
					'https://github.com/liferay/liferay-js-toolkit/wiki/Report-messages#0003',
				source: 'replace-browser-modules',
				things: [
					"Alias 'random' configured in project's root folder will " +
						'not be visible from outside because a local module ' +
						'with the same name exists',
				],
			},
		]);
	});

	it('collisions are correctly resolved to closest alias', () => {
		const unrolledAliasMap: UnrolledAliasesMap = {
			'/home/me/project/dir/util/random.js': [
				{
					absDir: new FilePath('/home/me/project/dir/util', {
						posix: true,
					}),
					fromType: AliasFromType.LOCAL,
					from: './random.js',
					to: './browser-random2.js',
				},
				{
					absDir: new FilePath('/home/me/project/dir', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: './util/random.js',
					to: './browser-random1.js',
				},
			],
		};

		reportAndResolveCollisions(log, absRootDir, unrolledAliasMap);

		expect(unrolledAliasMap).toEqual({
			'/home/me/project/dir/util/random.js': [
				{
					absDir: new FilePath('/home/me/project/dir/util', {
						posix: true,
					}),
					fromType: AliasFromType.LOCAL,
					from: './random.js',
					to: './browser-random2.js',
				},
			],
		});

		expect(log.messages).toEqual([
			{
				level: 'warn',
				link:
					'https://github.com/liferay/liferay-js-toolkit/wiki/Report-messages#0004',
				source: 'replace-browser-modules',
				things: [
					"File 'dir/util/random.js' is aliased more than once, " +
						"only the alias configured in 'dir/util' will be " +
						'visible when required from outside',
				],
			},
		]);
	});

	it('removed aliases are ignored before collisions are resolved', () => {
		const unrolledAliasMap: UnrolledAliasesMap = {
			'/home/me/project/dir/random.js': [
				{
					absDir: new FilePath('/home/me/project/dir', {posix: true}),
					fromType: AliasFromType.EXTERNAL,
					from: 'random',
					to: './browser-random.js',
				},
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: './dir/random.js',
					to: './browser-random.js',
				},
			],
		};

		jest.spyOn(fs, 'statSync').mockReturnValue({
			isFile: () => true,
		});

		reportAndResolveCollisions(log, absRootDir, unrolledAliasMap);

		expect(unrolledAliasMap).toEqual({
			'/home/me/project/dir/random.js': [
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: './dir/random.js',
					to: './browser-random.js',
				},
			],
		});

		expect(log.messages).toEqual([
			{
				level: 'warn',
				link:
					'https://github.com/liferay/liferay-js-toolkit/wiki/Report-messages#0003',
				source: 'replace-browser-modules',
				things: [
					"Alias 'random' configured in 'dir' will not be visible " +
						'from outside because a local module with the same ' +
						'name exists',
				],
			},
		]);
	});

	it('aliases colliding in same dir are resolved to last one', () => {
		const unrolledAliasMap: UnrolledAliasesMap = {
			'/home/me/project/random.js': [
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: './random.js',
					to: './browser-random1.js',
				},
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: '/random.js',
					to: './browser-random2.js',
				},
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: './random',
					to: './browser-random3.js',
				},
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: '/random',
					to: './browser-random4.js',
				},
			],
		};

		reportAndResolveCollisions(log, absRootDir, unrolledAliasMap);

		expect(unrolledAliasMap).toEqual({
			'/home/me/project/random.js': [
				{
					absDir: new FilePath('/home/me/project', {posix: true}),
					fromType: AliasFromType.LOCAL,
					from: '/random',
					to: './browser-random4.js',
				},
			],
		});

		expect(log.messages).toEqual([
			{
				level: 'warn',
				link:
					'https://github.com/liferay/liferay-js-toolkit/wiki/Report-messages#0004',
				source: 'replace-browser-modules',
				things: [
					"File 'random.js' is aliased more than once, only the " +
						"alias configured in project's root folder will be " +
						'visible when required from outside',
				],
			},
		]);
	});
});
