/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const getProjectMainModuleFilePath = require('../utils/getProjectMainModuleFilePath');
const getBridgeExportName = require('./getBridgeExportName');

/**
 * Create a webpack main entry point containing the standard entry points
 * contents plus a re-export of all the bridged packages.
 *
 * @param {string} filePath the path to the output file
 *
 */
module.exports = function (filePath) {
	let code = '';

	// Re-export everything from original entry point

	const projectMainModuleFilePath = getProjectMainModuleFilePath();

	if (fs.existsSync(projectMainModuleFilePath)) {
		const projectMainModuleRelName = path
			.relative(path.dirname(filePath), projectMainModuleFilePath)
			.replace(/\\/g, '/');

		code += `
export {default} from './${projectMainModuleRelName}';
export * from './${projectMainModuleRelName}';

`;
	}

	const {bridges} = getMergedConfig('npmscripts', 'federation');

	if (bridges) {
		for (const packageName of bridges) {
			const exportName = getBridgeExportName(packageName);

			code += `export * as ${exportName} from '${packageName}';\n`;
		}
	}

	// Finally, write the file

	fs.writeFileSync(filePath, code);
};
