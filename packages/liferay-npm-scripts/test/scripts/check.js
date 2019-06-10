/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

describe('scripts/check.js', () => {
	let cwd;
	let check;
	let spawnSync;
	let temp;

	beforeEach(() => {
		cwd = process.cwd();
		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-'));
		process.chdir(temp);

		jest.mock('../../src/utils/spawnSync');
		check = require('../../src/scripts/check');
		spawnSync = require('../../src/utils/spawnSync');
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes prettier', () => {
		check();
		expect(spawnSync).toHaveBeenCalledWith('prettier', expect.anything());
	});

	describe('when no "check" globs are configured', () => {
		let log;

		beforeEach(() => {
			const config = `module.exports = ${JSON.stringify(
				{check: []},
				null,
				2
			)};`;

			fs.writeFileSync('npmscripts.config.js', config);

			jest.resetModules();
			jest.mock('../../src/utils/log');
			check = require('../../src/scripts/check');
			log = require('../../src/utils/log');
			spawnSync = require('../../src/utils/spawnSync');
		});

		it('logs a message indicating how to configure globs', () => {
			check();
			expect(log).toHaveBeenCalledWith(
				expect.stringContaining(
					'paths can be configured via npmscripts.config.js'
				)
			);
		});

		it('does not run prettier', () => {
			check();
			expect(spawnSync).not.toHaveBeenCalled();
		});
	});
});
