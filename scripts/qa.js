/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const path = require('path');

const qaDir = path.join(__dirname, '..', 'qa');
const samplesDir = path.join(qaDir, 'samples');

childProcess.spawnSync('node', [path.join(qaDir, 'generate-samples.js')], {
	stdio: 'inherit',
	cwd: qaDir,
	shell: true,
});

childProcess.spawnSync('lerna', ['run', 'deploy'], {
	stdio: 'inherit',
	cwd: samplesDir,
	shell: true,
});
