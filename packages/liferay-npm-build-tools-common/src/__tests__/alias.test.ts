/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import { loadAliases } from '../alias';
import FilePath from '../file-path';

const fixturesDir = new FilePath(path.join(__dirname, '__fixtures__', 'alias'));

describe('loadAliases', () => {
	it('works with typical configuration', () => {
		const aliases = loadAliases(fixturesDir.join('typical.json'), [
			'browser',
		]);

		expect(aliases).toEqual({
			fs: './fs-shim.js',
			'./random.js': './random-shim.js',
			'./log': './log-shim.js',
			'./utils/printer.js': './printer-shim.js',
		});
	});

	it('loads multiple alias fields in order', () => {
		const aliases = loadAliases(fixturesDir.join('multiple.json'), [
			'browser',
			'unpkg',
		]);

		expect(aliases).toEqual({
			'./random.js': './random-shim.js',
			fs: './fs-shim2.js',
			'./log': './log-shim.js',
		});
	});

	it('loads multiple alias fields in reverse order', () => {
		const aliases = loadAliases(fixturesDir.join('multiple.json'), [
			'unpkg',
			'browser',
		]);

		expect(aliases).toEqual({
			'./random.js': './random-shim.js',
			fs: './fs-shim.js',
			'./log': './log-shim.js',
		});
	});

	it('normalizes / to ./', () => {
		const aliases = loadAliases(fixturesDir.join('normalize.json'), [
			'browser',
		]);

		expect(aliases).toEqual({
			'./random.js': './random-shim.js',
		});
	});

	it('does not fail when an alias field is not found', () => {
		expect(() =>
			loadAliases(fixturesDir.join('typical.json'), [
				'bad-field',
				'browser',
			])
		).not.toThrow();
	});

	it('does not fail when package.json file is not found', () => {
		expect(() =>
			loadAliases(fixturesDir.join('missing-file.json'), ['browser'])
		).not.toThrow();
	});

	it('throws when package.json is not valid JSON', () => {
		expect(() =>
			loadAliases(fixturesDir.join('invalid.json'), ['browser'])
		).toThrow();
	});

	it('caches calls correctly', () => {
		const pkgJsonFile = fixturesDir.join('multiple.json');

		const alias1 = loadAliases(pkgJsonFile, ['browser']);
		const alias2 = loadAliases(pkgJsonFile, ['unpkg']);
		const alias3 = loadAliases(pkgJsonFile, ['browser', 'unpkg']);
		const alias4 = loadAliases(pkgJsonFile, ['browser']);
		const alias5 = loadAliases(pkgJsonFile, ['unpkg']);

		expect(alias2).not.toBe(alias1);

		expect(alias3).not.toBe(alias1);
		expect(alias3).not.toBe(alias2);

		expect(alias4).toEqual(alias1);

		expect(alias5).toEqual(alias2);
	});

	it('does not contain spurious values for module "toString"', () => {
		const aliases = loadAliases(fixturesDir.join('typical.json'), [
			'browser',
		]);

		expect(aliases['toString']).toBeUndefined();
	})
});
