/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const permute = require('../../src/utils/permute');

describe('permute()', () => {
	it('permutes an empty array', () => {
		expect(permute([])).toEqual([[]]);
	});

	it('permutes a array of one item', () => {
		expect(permute(['a'])).toEqual([['a']]);
	});

	it('permutes a array of two items', () => {
		expect(permute(['a', 'b'])).toEqual([['a', 'b'], ['b', 'a']]);
	});

	it('permutes a array of three items', () => {
		expect(permute(['a', 'b', 'c'])).toEqual([
			['a', 'b', 'c'],
			['b', 'a', 'c'],
			['c', 'a', 'b'],
			['a', 'c', 'b'],
			['b', 'c', 'a'],
			['c', 'b', 'a']
		]);
	});
});
