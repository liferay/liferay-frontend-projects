/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

module.exports = function getProjectDirectories() {
	return fs
		.readdirSync(path.join(__dirname, '..', '..', 'packages'), {
			withFileTypes: true,
		})
		.map((entry) => {
			if (entry.isDirectory()) {
				return path.join(__dirname, '..', '..', 'packages', entry.name);
			}
		})
		.filter(Boolean);
};
