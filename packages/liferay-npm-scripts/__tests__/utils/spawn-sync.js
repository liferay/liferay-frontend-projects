/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const spawnSync = require('../../src/utils/spawn-sync');

describe('spawnSync()', () => {
	it('throws for non-existent commands', () => {
		expect(() => spawnSync('non-existent-command')).toThrow(/ENOENT/);
	});

	it('throws for commands that return a non-zero exit code', () => {
		expect(() => spawnSync('false')).toThrow(/code 1/);
	});

	it('succeeds for valid commands', () => {
		expect(() => spawnSync('true')).not.toThrow();
	});
});
