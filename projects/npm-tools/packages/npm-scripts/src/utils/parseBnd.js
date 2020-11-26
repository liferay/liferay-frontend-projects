/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

/**
 * Parse a bnd.bnd file and return it as a hash (object) of key-value pairs.
 *
 * Note that the returned values are not modified in any way other than trimming
 * by the sides.
 *
 * @param {string} filePath path to bnd file (by default bnb.bnd in cwd)
 *
 * @return {object} a hash of parsed key-value pairs.
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
