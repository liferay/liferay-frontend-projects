/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');

module.exports = function isPortalDir(tagOrDir) {
	try {
		return fs.statSync(tagOrDir).isDirectory();
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return false;
};
