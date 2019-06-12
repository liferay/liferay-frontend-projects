/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const filterGlobs = require('../../src/utils/filterGlobs');

describe('filterGlobs()', () => {
	const globs = ['**/*.css', '**/*.js', '**/*.scss', '**/*.ts', '**/*.tsx'];

	it('filters given a single extension', () => {
		expect(filterGlobs(globs, '.scss')).toEqual(['**/*.scss']);
	});

	it('filters given a multiple extensions', () => {
		expect(filterGlobs(globs, '.js', '.ts', '.tsx')).toEqual([
			'**/*.js',
			'**/*.ts',
			'**/*.tsx'
		]);
	});

	it('returns nothing when nothing matches', () => {
		expect(filterGlobs(globs, '.doc')).toEqual([]);
	});

	it('complains given an invalid extension', () => {
		expect(() => filterGlobs(globs, 'js')).toThrow(
			/expected extension "js"/
		);
	});
});
