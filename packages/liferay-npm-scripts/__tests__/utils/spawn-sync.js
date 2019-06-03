/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const spawnSync = require('../../src/utils/spawn-sync');

const {SpawnError} = spawnSync;

describe('spawnSync()', () => {
	it('succeeds for valid commands', () => {
		expect(() => spawnSync('true')).not.toThrow();
	});

	describe('commands that return a non-zero exit code', () => {
		it('throws an error containing the exit code', () => {
			expect(() => spawnSync('false')).toThrow(/code 1/);
		});

		it('throws a SpawnError', () => {
			expect(() => spawnSync('false')).toThrow(SpawnError);
		});
	});

	describe('non-existent commands', () => {
		it('throws an error that describes why the command did not run', () => {
			expect(() => spawnSync('non-existent-command')).toThrow(/ENOENT/);
		});

		it('throws an Error, not a SpawnError', () => {
			expect(() => spawnSync('non-existent-command')).not.toThrow(
				SpawnError
			);
		});
	});
});
