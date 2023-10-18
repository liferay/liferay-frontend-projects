/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../../src/utils/getMergedConfig');
const getFixturePath = require('../../support/getFixturePath');

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
		let cwd;

		beforeEach(() => {
			cwd = process.cwd();
		});

		afterEach(() => {
			process.chdir(cwd);
		});

		function getFixture(id) {
			return getFixturePath('utils', 'getDXPVersion', id, 'modules');
		}

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
					'@babel/preset-react',
					'@babel/preset-typescript',
				]);

				expect(config.overrides[0].presets).toMatchObject([
					['@babel/preset-env', expect.anything()],
					'fancy',
					'@babel/preset-react',
				]);
			});
		});

		it('uses the standard config by default', () => {
			const config = getMergedConfig('babel');

			expect(config.presets).toEqual(
				expect.arrayContaining([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('Chrome version'),
						},
					],
				])
			);
		});

		it('uses the standard config in 7.4', () => {
			const modules = getFixture('7.4');

			process.chdir(modules);

			const config = getMergedConfig('babel');

			expect(config.presets).toEqual(
				expect.arrayContaining([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('Chrome version'),
						},
					],
				])
			);
		});

		it('uses the legacy config in 7.3', () => {
			const modules = getFixture('7.3');

			process.chdir(modules);

			const config = getMergedConfig('babel');

			expect(config.presets).toEqual(
				expect.arrayContaining([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('defaults'),
						},
					],
				])
			);
		});

		it('uses the legacy config in 7.2', () => {
			const modules = getFixture('7.2');

			process.chdir(modules);

			const config = getMergedConfig('babel');

			expect(config.presets).toEqual(
				expect.arrayContaining([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('defaults'),
						},
					],
				])
			);
		});

		it('uses the legacy config in 7.1', () => {
			const modules = getFixture('7.1');

			process.chdir(modules);

			const config = getMergedConfig('babel');

			expect(config.presets).toEqual(
				expect.arrayContaining([
					[
						'@babel/preset-env',
						{
							targets: expect.stringContaining('defaults'),
						},
					],
				])
			);
		});
	});
});
