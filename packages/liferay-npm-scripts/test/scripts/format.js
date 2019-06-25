/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

describe('scripts/format.js', () => {
	let cwd;
	let format;
	let spawnSync;
	let temp;

	beforeEach(() => {
		cwd = process.cwd();
		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));
		process.chdir(temp);

		jest.mock('../../src/utils/spawnSync');
		format = require('../../src/scripts/format');
		spawnSync = require('../../src/utils/spawnSync');
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes prettier', () => {
		format();
		expect(spawnSync).toHaveBeenCalledWith('prettier', expect.anything());
	});

	describe('when no globs are configured', () => {
		let log;

		beforeEach(() => {
			const config = `module.exports = ${JSON.stringify(
				{check: [], fix: []},
				null,
				2
			)};`;

			fs.writeFileSync('npmscripts.config.js', config);

			jest.resetModules();
			jest.mock('../../src/utils/log');
			format = require('../../src/scripts/format');
			log = require('../../src/utils/log');
			spawnSync = require('../../src/utils/spawnSync');
		});

		it('logs a message indicating how to configure globs', () => {
			format();
			expect(log).toHaveBeenCalledWith(
				expect.stringContaining('No globs applicable')
			);
		});

		it('does not run prettier', () => {
			format();
			expect(spawnSync).not.toHaveBeenCalled();
		});
	});
});
