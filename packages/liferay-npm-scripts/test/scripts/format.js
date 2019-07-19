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
	let prettier;
	let temp;

	const source = 'alert("hello");';

	beforeEach(() => {
		cwd = process.cwd();
		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));
		process.chdir(temp);
		fs.mkdirSync('src');
		fs.writeFileSync('src/example.js', source);

		jest.mock('prettier');
		jest.mock('../../src/utils/log');
		format = require('../../src/scripts/format');
		prettier = require('prettier');
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes prettier', () => {
		format();
		expect(prettier.check).toHaveBeenCalledWith(
			source,
			expect.objectContaining({filepath: 'src/example.js'})
		);
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
		});

		it('logs a message indicating how to configure globs', () => {
			format();
			expect(log).toHaveBeenCalledWith(
				expect.stringContaining('No globs applicable')
			);
		});

		it('does not invoke prettier', () => {
			format();
			expect(prettier.check).not.toHaveBeenCalled();
		});
	});
});
