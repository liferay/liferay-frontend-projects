/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const formatJSP = require('../../src/jsp/formatJSP');
const prettier = require('../../src/prettier');
const format = require('../../src/scripts/format');
const log = require('../../src/utils/log');

jest.mock('../../src/jsp/formatJSP');
jest.mock('../../src/utils/log');

describe('scripts/format.js', () => {
	let INIT_CWD;
	let cwd;
	let temp;

	const source = {
		js: 'alert("hello");',
		jsp: '<%= "hello" %>',
	};

	beforeEach(() => {
		INIT_CWD = process.env.INIT_CWD;

		cwd = process.cwd();

		jest.resetAllMocks();

		jest.spyOn(prettier, 'check');
		jest.spyOn(prettier, 'format');

		temp = fs.mkdtempSync(path.join(os.tmpdir(), 'format-'));

		process.env.INIT_CWD = temp;

		process.chdir(temp);

		fs.mkdirSync('src');

		fs.writeFileSync('src/example.js', source.js);
		fs.writeFileSync('src/example.jsp', source.jsp);
	});

	afterEach(() => {
		process.chdir(cwd);

		process.env.INIT_CWD = INIT_CWD;
	});

	it('invokes check() on our prettier.check() wrapper', async () => {
		await format();

		expect(prettier.check).toHaveBeenCalledWith(
			source.js,
			expect.objectContaining({filepath: 'src/example.js'})
		);
	});

	it('invokes format() on our prettier.format() wrapper', async () => {
		await format();

		expect(prettier.format).toHaveBeenCalledWith(
			source.js,
			expect.objectContaining({filepath: 'src/example.js'})
		);
	});

	it('invokes formatJSP()', async () => {
		await format();

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

		it('logs a message indicating how to configure globs', async () => {
			await format();

			expect(log).toHaveBeenCalledWith(
				expect.stringContaining('No globs applicable')
			);
		});

		it('does not invoke prettier.check', async () => {
			await format();

			expect(prettier.check).not.toHaveBeenCalled();
		});

		it('does not invoke formatJSP', async () => {
			await format();

			expect(formatJSP).not.toHaveBeenCalled();
		});
	});
});
