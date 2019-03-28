/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const CWD = process.cwd();
const PACKAGE_FILE_PATH = path.join(CWD, 'package.json');

const TEMP_STRING = 'TEMP-';

/**
 * Removes TEMP- portion of the file name or package.json key
 * @param {string} dir Directory where to find the file
 * @param {string} fileName Name of the file
 * @param {string=} packageKey Name of the package.json key
 */
function removeFromTemp(dir, fileName, packageKey) {
	const filePath = path.join(dir, TEMP_STRING + fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, fileName));
	}

	if (packageKey && fs.existsSync(PACKAGE_FILE_PATH)) {
		const configFile = fs.readFileSync(PACKAGE_FILE_PATH);
		const config = JSON.parse(configFile);

		if (config && config[TEMP_STRING + packageKey]) {
			config[packageKey] = config[TEMP_STRING + packageKey];

			delete config[TEMP_STRING + packageKey];

			fs.writeFileSync(
				path.join(CWD, 'package.json'),
				JSON.stringify(config, null, '\t')
			);
		}
	}
}

/**
 * Renames file as TEMP-{fileName} or renames package.json key
 * @param {string} dir Directory where to find the file
 * @param {string} fileName Name of the file
 * @param {string=} packageKey Name of the package.json key
 */
function moveToTemp(dir, fileName, packageKey) {
	const filePath = path.join(dir, fileName);
	const fileExists = fs.existsSync(filePath);

	if (fileExists) {
		fs.renameSync(filePath, path.join(dir, TEMP_STRING + fileName));
	}

	if (packageKey && fs.existsSync(PACKAGE_FILE_PATH)) {
		const configFile = fs.readFileSync(PACKAGE_FILE_PATH);
		const config = JSON.parse(configFile);

		if (config && config[packageKey]) {
			config[TEMP_STRING + packageKey] = config[packageKey];

			delete config[packageKey];

			fs.writeFileSync(
				path.join(CWD, 'package.json'),
				JSON.stringify(config, null, '\t')
			);
		}
	}
}

exports.removeFromTemp = removeFromTemp;
exports.moveToTemp = moveToTemp;
