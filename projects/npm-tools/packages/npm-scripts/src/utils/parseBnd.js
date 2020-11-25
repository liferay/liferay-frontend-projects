/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

/**
 *
 */
function parseBnd(filePath = './bnd.bnd') {
	const content = fs.readFileSync(filePath).toString();
	const lines = content.replace(/\\\n/g, ' ').split('\n');

	return lines.reduce((entries, line) => {
		line = line.trim();

		if (line === '') {
			return entries;
		}

		const i = line.indexOf(':');
		const key = line.substring(0, i);
		const value = line.substring(i + 2);

		entries[key] = value;

		return entries;
	}, {});
}

module.exports = parseBnd;
