/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

describe('scripts/lint.js', () => {
	let cwd;
	let lint;
	let spawnSync;
	let temp;

	beforeEach(() => {
		cwd = process.cwd();
		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-'));
		process.chdir(temp);

		jest.mock('../../src/utils/spawn-sync');
		lint = require('../../src/scripts/lint');
		spawnSync = require('../../src/utils/spawn-sync');
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes prettier', () => {
		lint();
		expect(spawnSync).toHaveBeenCalledWith('prettier', expect.anything());
	});

	describe('when no "lint" globs are configured', () => {
		let log;

		beforeEach(() => {
			const config = `module.exports = ${JSON.stringify(
				{lint: []},
				null,
				2
			)};`;

			fs.writeFileSync('npmscripts.config.js', config);

			jest.resetModules();
			jest.mock('../../src/utils/log');
			lint = require('../../src/scripts/lint');
			log = require('../../src/utils/log');
			spawnSync = require('../../src/utils/spawn-sync');
		});

		it('logs a message indicating how to configure globs', () => {
			lint();
			expect(log).toHaveBeenCalledWith(
				expect.stringContaining(
					'paths can be configured via npmscripts.config.js'
				)
			);
		});

		it('does not run prettier', () => {
			lint();
			expect(spawnSync).not.toHaveBeenCalled();
		});
	});
});
