/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const index = require('../src/index');

describe('index.js', () => {
	let argv;

	function setArgv(...args) {
		process.argv = ['/path/to/node', '/path/to/scripts', ...args];
	}

	beforeEach(() => {
		argv = process.argv;
	});

	afterEach(() => {
		process.argv = argv;
	});

	it('complains if given an invalid command', () => {
		setArgv('foo');
		expect(() => index()).toThrow('requires a valid command');
	});

	it('complains if not given an command', () => {
		setArgv();
		expect(() => index()).toThrow('requires a valid command');
	});
});
