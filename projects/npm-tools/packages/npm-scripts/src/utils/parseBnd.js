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
function parseBnd(filePath = 'bnd.bnd') {
	let content = fs.readFileSync(filePath, 'utf8');

	// Convert Windows line feeds to Unix

	content = content.replace(/\r\n/g, '\n');

	// Handle line continuation (`\` at the end of a line)

	content = content.replace(/\\\n/g, ' ');

	const lines = content.split('\n');

	return lines.reduce((entries, line) => {
		line = line.trim();

		if (line === '') {
			return entries;
		}

		const i = line.indexOf(':');

		const key = line.substring(0, i);
		const value = line.substring(i + 1).trimLeft();

		entries[key] = value;

		return entries;
	}, {});
}

module.exports = parseBnd;
