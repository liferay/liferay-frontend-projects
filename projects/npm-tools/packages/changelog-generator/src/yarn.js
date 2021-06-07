/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const child_process = require('child_process');
const fs = require('fs');

const {info, log} = require('./console');

const packageJson = JSON.parse(fs.readFileSync('package.json'));

function yarn(command) {
	if (packageJson.scripts && packageJson.scripts[command]) {
		info('Running process: yarn ' + command);

		const {
			error,
			signal,
			status,
			stderr,
			stdout,
		} = child_process.spawnSync('yarn', [command], {stdio: 'inherit'});

		if (status !== 0) {
			// eslint-disable-next-line no-console
			log(
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
	}
}

module.exports = yarn;
