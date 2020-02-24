/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {spawn, spawnSync} = require('child_process');
const fs = require('fs-extra');

const {run} = require('./util');

if (!fs.existsSync('build/demo/index.html')) {
	run('yarn', 'build-demo');
}

spawn('node', ['./bin/combo.js'], {
	stdio: 'inherit',
});

spawnSync('node', ['./bin/demo-server.js'], {
	stdio: 'inherit',
});
