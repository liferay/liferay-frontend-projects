/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

describe('scripts/lint.js', () => {
	it('logs a message when no appropriate globs are provided', () => {
		jest.resetModules();

		jest.isolateModules(() => {
			jest.mock('../../src/utils/log');

			jest.mock('../../src/utils/getMergedConfig', () => {
				return () => {
					return ['**/*.jsp'];
				};
			});

			const lint = require('../../src/scripts/lint');
			const log = require('../../src/utils/log');

			lint();

			expect(log).toBeCalledWith(
				expect.stringContaining('No globs applicable')
			);
		});
	});
});
