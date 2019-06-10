/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const TEMP_STRING = 'TEMP-';

/**
 * Removes TEMP- portion of the file name or package.json key
 * @param {string} fileName Name of the file
 * @param {string=} packageKey Name of the package.json key
 */
function removeFromTemp(fileName, packageKey) {
	const filePath = TEMP_STRING + fileName;
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, fileName);
	}

	if (packageKey && fs.existsSync('package.json')) {
		const configFile = fs.readFileSync('package.json');
		const config = JSON.parse(configFile);

		if (config && config[TEMP_STRING + packageKey]) {
			config[packageKey] = config[TEMP_STRING + packageKey];

			delete config[TEMP_STRING + packageKey];

			fs.writeFileSync(
				'package.json',
				JSON.stringify(config, null, '\t')
			);
		}
	}
}

module.exports = removeFromTemp;
