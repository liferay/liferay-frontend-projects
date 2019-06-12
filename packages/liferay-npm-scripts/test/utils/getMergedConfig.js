/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../../src/utils/getMergedConfig');

/**
 * Helper function that overrides `getUserConfig()` for the duration of the
 * callback.
 */
function withUserConfig(mockConfig = {}, callback) {
	// This line required due to: https://github.com/facebook/jest/issues/7863
	jest.resetModules();

	jest.isolateModules(() => {
		jest.mock('../../src/utils/getUserConfig', () => {
			return () => {
				return mockConfig;
			};
		});

		const getMergedConfig = require('../../src/utils/getMergedConfig');

		callback(getMergedConfig);
	});
}

describe('getMergedConfig()', () => {
	it('rejects invalid types', () => {
		expect(() => getMergedConfig('foo')).toThrow('not a valid config');
	});

	describe('"npmscripts" config', () => {
		it('rejects non-simple globs', () => {
			withUserConfig({fix: ['**/*.{js,scss}']}, getMergedConfig => {
				expect(() => getMergedConfig('npmscripts')).toThrow(
					'glob "**/*.{js,scss}" must end with a simple extension'
				);
			});
		});

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
