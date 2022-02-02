/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {r2} = require('liferay-theme-tasks');

describe('index.js', () => {
	it('exposes the r2 API from the "main" package resource', () => {
		expect(require('liferay-theme-tasks')).toBe(require('..'));

		expect(Object.keys(r2).sort()).toEqual(['exec', 'swap', 'valueMap']);
	});

	describe('r2.swap()', () => {
		const {swap} = r2;

		it('swap text alignment', () => {
			expect(swap('p{text-align:right;}')).toEqual(
				'p{text-align:left;}',
				'text-align: left => text-align: right'
			);
			expect(swap('p{text-align:left;}')).toEqual(
				'p{text-align:right;}',
				'text-align: right => text-align: left'
			);
		});
	});
});
