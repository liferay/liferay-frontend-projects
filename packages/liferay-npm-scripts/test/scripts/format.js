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
	let formatJSP;
	let prettier;
	let temp;

	const source = {
		js: 'alert("hello");',
		jsp: '<%= "hello" %>'
	};

	beforeEach(() => {
		cwd = process.cwd();

		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));

		process.chdir(temp);

		fs.mkdirSync('src');

		fs.writeFileSync('src/example.js', source.js);
		fs.writeFileSync('src/example.jsp', source.jsp);

		jest.mock('prettier');
		jest.mock('../../src/format/formatJSP');
		jest.mock('../../src/utils/log');

		format = require('../../src/scripts/format');
		formatJSP = require('../../src/format/formatJSP');
		prettier = require('prettier');
	});

	afterEach(() => {
		jest.resetModules();
		process.chdir(cwd);
	});

	it('invokes prettier.check()', () => {
		format();
		expect(prettier.check).toHaveBeenCalledWith(
			source.js,
			expect.objectContaining({filepath: 'src/example.js'})
		);
	});

	it('invokes formatJSP()', () => {
		format();
		expect(formatJSP).toHaveBeenCalledWith(
			source.jsp,
			expect.objectContaining({filepath: 'src/example.jsp'})
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

		it('does not invoke prettier.check', () => {
			format();
			expect(prettier.check).not.toHaveBeenCalled();
		});

		it('does not invoke formatJSP', () => {
			format();
			expect(formatJSP).not.toHaveBeenCalled();
		});
	});
});
