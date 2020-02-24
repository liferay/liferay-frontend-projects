/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const webpack = require('../../src/scripts/webpack');
const spawnSync = require('../../src/utils/spawnSync');

jest.mock('../../src/utils/spawnSync');

const FIXTURES = path.resolve(
	__dirname,
	'../../__fixtures__/scripts/webpack/sample'
);

describe('scripts/webpack.js', () => {
	let cwd;

	beforeEach(() => {
		cwd = process.cwd();
		jest.resetAllMocks();
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes webpack', () => {
		webpack();

		expect(spawnSync).toHaveBeenCalledWith('webpack', [
			'--config',
			expect.stringMatching(/[/\\]webpack\.config\.js$/)
		]);
	});

	it('passes arguments to webpack', () => {
		webpack('--verbose');

		expect(spawnSync).toHaveBeenCalledWith('webpack', [
			'--config',
			expect.stringMatching(/[/\\]webpack\.config\.js$/),
			'--verbose'
		]);
	});

	it('executes wepback-dev-server when "--watch" is passed', () => {
		process.chdir(FIXTURES);

		webpack('--watch');

		expect(spawnSync).toHaveBeenCalledWith('webpack-dev-server', [
			'--config',
			expect.stringMatching(/[/\\]webpack\.config\.dev\.js$/)
		]);
	});

	it('passes arguments to wepback-dev-server', () => {
		process.chdir(FIXTURES);
		webpack('--watch', '--lazy');

		expect(spawnSync).toHaveBeenCalledWith('webpack-dev-server', [
			'--config',
			expect.stringMatching(/[/\\]webpack\.config\.dev\.js$/),
			'--lazy'
		]);
	});

	it('complains when "--watch" is passed without appropriate config', () => {
		expect(() => webpack('--watch')).toThrow(
			/--watch supplied but "webpack.config.dev.js" not found/
		);
	});
});
