/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const TEMP_STRING = 'TEMP-';

/**
 * Renames file as TEMP-{fileName} or renames package.json key
 * @param {string} fileName Name of the file
 * @param {string=} packageKey Name of the package.json key
 */
function moveToTemp(fileName, packageKey) {
	const fileExists = fs.existsSync(fileName);

	if (fileExists) {
		fs.renameSync(fileName, TEMP_STRING + fileName);
	}

	if (packageKey && fs.existsSync('package.json')) {
		const configFile = fs.readFileSync('package.json');
		const config = JSON.parse(configFile);

		if (config && config[packageKey]) {
			config[TEMP_STRING + packageKey] = config[packageKey];

			delete config[packageKey];

			fs.writeFileSync(
				'package.json',
				JSON.stringify(config, null, '\t')
			);
		}
	}
}

module.exports = moveToTemp;
