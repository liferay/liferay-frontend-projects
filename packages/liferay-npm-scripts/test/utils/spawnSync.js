/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const os = require('os');
const spawnSync = require('../../src/utils/spawnSync');

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
		const win32 = os.platform() === 'win32';

		it('throws an error that describes why the command did not run', () => {
			if (win32) {
				expect(() => spawnSync('non-existent-command')).toThrow();
			} else {
				expect(() => spawnSync('non-existent-command')).toThrow(
					/ENOENT/
				);
			}
		});

		it('throws an Error, not a SpawnError', () => {
			if (win32) {
				// Windows is "special": it "exits" with a non-zero
				// status even though it never spawned the executable.
			} else {
				expect(() => spawnSync('non-existent-command')).not.toThrow(
					SpawnError
				);
			}
		});
	});
});
