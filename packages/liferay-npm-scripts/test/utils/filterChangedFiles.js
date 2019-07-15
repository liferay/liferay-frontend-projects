/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const filterChangedFiles = require('../../src/utils/filterChangedFiles');

describe('filterChangedFiles()', () => {
	beforeEach(() => {
		delete process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES;
	});

	afterEach(() => {
		delete process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES;
	});

	describe('when LIFERAY_NPM_SCRIPTS_CHANGED_FILES is unset', () => {
		it('returns all files', () => {
			const files = ['a', 'b', 'c'];

			expect(filterChangedFiles(files)).toEqual(files);
		});
	});

	describe('when LIFERAY_NPM_SCRIPTS_CHANGED_FILES is empty', () => {
		it('returns nothing', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = '';

			const files = ['a', 'b', 'c'];

			expect(filterChangedFiles(files)).toEqual([]);
		});
	});

	describe('when LIFERAY_NPM_SCRIPTS_CHANGED_FILES is non-empty', () => {
		it('returns files with absolute paths that match absolute paths', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = '/a,/c';

			const files = ['/a', '/b', '/c'];

			expect(filterChangedFiles(files)).toEqual(['/a', '/c']);
		});

		it('returns files with absolute paths that match relative paths', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = 'a,c';

			const files = [path.resolve('a'), path.resolve('b'), path.resolve('c')];

			expect(filterChangedFiles(files)).toEqual([files[0], files[2]]);
		});

		it('returns files with relative paths that match absolute paths', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = [
				path.resolve('a'),
				path.resolve('c'),
			].join(',');

			const files = ['a', 'b', 'c'];

			expect(filterChangedFiles(files)).toEqual(['a', 'c']);
		});

		it('returns files with relative paths that match relative paths', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = 'a,c';

			const files = ['a', 'b', 'c'];

			expect(filterChangedFiles(files)).toEqual(['a', 'c']);
		});

		it('uses normalized paths when computing matches', () => {
			process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES = 'a,./c';

			const files = ['a/sub/../../a', 'b', 'c'];

			expect(filterChangedFiles(files)).toEqual(['a/sub/../../a', 'c']);
		});
	});
});
