/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = {
	build: {
		temp: fs.mkdtempSync(path.join(os.tmpdir(), 'npm-scripts-')),
	},
};
