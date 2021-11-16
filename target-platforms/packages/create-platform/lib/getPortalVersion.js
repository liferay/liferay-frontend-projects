/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {spawnSync} = require('child_process');

const isPortalDir = require('./isPortalDir');

module.exports = function getPortalVersion(tagOrDir) {
	if (isPortalDir(tagOrDir)) {
		const {stdout} = spawnSync('git', ['describe', '--tags'], {
			cwd: tagOrDir,
			stdio: 'pipe',
		});

		return stdout.toString().trim();
	}
	else {
		return tagOrDir;
	}
};
