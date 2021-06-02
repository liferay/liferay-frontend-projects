/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const globby = require('globby');
const path = require('path');

const tscFile = path.join(__dirname, '..', 'node_modules', '.bin', 'tsc');

globby.sync(['packages/*/tsconfig.json']).forEach((tsconfigPath) => {
	const prjDir = path.dirname(tsconfigPath);

	childProcess.spawn('node', [tscFile, '-w', '--preserveWatchOutput'], {
		stdio: 'inherit',
		cwd: prjDir,
		shell: true,
	});
});

// Loop forever (use Ctrl+C to exit)

setInterval(() => {}, 60000);
