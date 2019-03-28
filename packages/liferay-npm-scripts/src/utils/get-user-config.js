/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const CWD = process.cwd();

/**
 * Helper to get configuration that is found in either a file or package.json
 * @param {string} filename Name of user config file
 * @param {string=} packageKey Name of the key used in package.json for configuration
 * @returns {Object}
 */
module.exports = function(filename, packageKey) {
	let config = {};

	const FILE_PATH = path.join(CWD, filename);
	const PACKAGE_FILE_PATH = path.join(CWD, 'package.json');

	if (fs.existsSync(FILE_PATH)) {
		const configFile = fs.readFileSync(FILE_PATH);

		config = JSON.parse(configFile);
	} else if (packageKey && fs.existsSync(PACKAGE_FILE_PATH)) {
		const configFile = fs.readFileSync(PACKAGE_FILE_PATH);
		const configJSON = JSON.parse(configFile);

		if (configJSON && configJSON[packageKey]) {
			config = configJSON[packageKey];
		}
	}

	return config;
};
