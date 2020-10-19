/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {spawnSync} = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const copy = (input, output) =>
	fs.copySync(input, output, {
		filter: (filePath) => !path.basename(filePath).startsWith('.'),
	});

const run = (binary, ...args) =>
	spawnSync(binary, args, {
		shell: true,
		stdio: 'inherit',
	});

module.exports = {copy, run};
