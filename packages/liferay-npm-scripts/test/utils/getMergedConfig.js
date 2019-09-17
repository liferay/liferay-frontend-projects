/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../../src/utils/getMergedConfig');

describe('getMergedConfig()', () => {
	it('rejects invalid types', () => {
		expect(() => getMergedConfig('foo')).toThrow('not a valid config');
	});

	describe('"npmscripts" config', () => {
		it('returns a specific property when requested', () => {
			expect(getMergedConfig('npmscripts', 'check')).toEqual(
				expect.any(Array)
			);
		});

		it('complains if a non-existent property is requested', () => {
			expect(() => getMergedConfig('npmscripts', 'lint')).toThrow(
				'property "lint" is missing'
			);
		});
	});
});
