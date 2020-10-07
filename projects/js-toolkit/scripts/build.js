/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const TSC = path.join(
	__dirname,
	'..',
	'..',
	'..',
	'node_modules',
	'.bin',
	process.platform === 'win32' ? 'tsc.cmd' : 'tsc'
);

const packages = fs
	.readdirSync(path.join(__dirname, '..', 'packages'), {withFileTypes: true})
	.map((entry) => {
		if (entry.isDirectory()) {
			return path.join(
				__dirname,
				'..',
				'packages',
				entry.name,
				'tsconfig.json'
			);
		}
	})
	.filter(Boolean);

const {error, signal, status, stderr, stdout} = child_process.spawnSync(
	TSC,
	['--build', ...packages],
	{stdio: 'inherit'}
);

if (status !== 0) {
	// eslint-disable-next-line no-console
	console.log(
		JSON.stringify({
			error: error ? error.toString() : 'n/a',
			signal,
			status,
			stderr: stderr ? stderr.toString() : 'n/a',
			stdout: stdout ? stdout.toString() : 'n/a',
		})
	);
	process.exit(1);
}
