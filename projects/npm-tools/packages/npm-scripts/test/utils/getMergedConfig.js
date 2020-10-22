/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
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

	describe('"babel" config', () => {
		it('strips blacklisted presets', () => {
			jest.resetModules();

			jest.isolateModules(() => {
				const getMergedConfig = require('../../src/utils/getMergedConfig');

				jest.mock('../../src/utils/getUserConfig', () => {

					// Example use case from dynamic-data-mapping-form-builder:
					// blacklist the "react" preset in order to use the
					// "incremental-dom" plug-in.

					return jest.fn(() => ({
						liferay: {
							excludes: {
								presets: ['@babel/preset-react'],
							},
						},

						// This bit isn't real config, but it shows that
						// we can filter down below the top level:

						overrides: [
							{
								presets: ['fancy', '@babel/preset-react'],
							},
						],

						plugins: [
							[
								'incremental-dom',
								{
									components: true,
									namespaceAttributes: true,
									prefix: 'IncrementalDOM',
									runtime: 'iDOMHelpers',
								},
							],
						],
					}));
				});

				const config = getMergedConfig('babel');

				expect(config.presets).toEqual([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('Chrome version'),
						},
					],
				]);

				expect(config.overrides[0].presets).toMatchObject([
					['@babel/preset-env', expect.anything()],
					'fancy',
				]);
			});
		});
	});
});
