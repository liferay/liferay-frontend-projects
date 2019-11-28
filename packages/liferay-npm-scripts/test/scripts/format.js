/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const formatJSP = require('../../src/jsp/formatJSP');
const format = require('../../src/scripts/format');
const log = require('../../src/utils/log');
const prettier = require('../../src/utils/prettier');


jest.mock('../../src/jsp/formatJSP');
jest.mock('../../src/utils/log');

describe('scripts/format.js', () => {
	let cwd;
	let temp;

	const source = {
		js: `
			if (happy) {
				alert('hello');
			} else {
				console.log('sad');
			}
		`,
		jsp: '<%= "hello" %>'
	};

	beforeEach(() => {
		cwd = process.cwd();

		jest.resetAllMocks();

		jest.spyOn(prettier, 'check');
		jest.spyOn(prettier, 'format');

		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));

		process.chdir(temp);

		fs.mkdirSync('src');

		fs.writeFileSync('src/example.js', source.js);
		fs.writeFileSync('src/example.jsp', source.jsp);
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	it('invokes check() on our prettier.check() wrapper', () => {
		format();
		expect(prettier.check).toHaveBeenCalledWith(
			source.js,
			expect.objectContaining({filepath: 'src/example.js'})
		);
	});

	it('invokes format() on our prettier.format() wrapper', () => {
		format();
		expect(prettier.format).toHaveBeenCalledWith(
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
		beforeEach(() => {
			const config = `module.exports = ${JSON.stringify(
				{check: [], fix: []},
				null,
				2
			)};`;

			fs.writeFileSync('npmscripts.config.js', config);
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
