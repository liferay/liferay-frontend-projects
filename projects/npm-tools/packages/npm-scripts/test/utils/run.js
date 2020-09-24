/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const run = require('../../src/utils/run');

describe('run()', () => {
	it('runs a command and returns its output', () => {
		expect(run('echo', 'hello')).toBe('hello');
	});

	it('reports the exit status of failed commands', () => {
		// NOTE: we want the error message format to be stable, because
		// `filterChangedFiles()` depends on it.

		expect(() => run('false')).toThrow(
			'run(): command `false` exited with status 1.'
		);
	});
});
