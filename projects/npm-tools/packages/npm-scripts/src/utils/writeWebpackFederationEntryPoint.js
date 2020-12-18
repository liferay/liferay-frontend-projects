/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {transformJsSource} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');

const relocateImports = require('../transform/js/relocateImports');
const getBridgeExportName = require('./getBridgeExportName');
const getMergedConfig = require('./getMergedConfig');
const getProjectMainModuleFilePath = require('./getProjectMainModuleFilePath');

/**
 * Create a webpack main entry point containing the standard entry points
 * contents plus a re-export of all the bridged packages.
 *
 * @param {string} filePath the path to the output file
 *
 * @return {Promise<void>}
 */
module.exports = async function (filePath) {
	const projectMainModuleFilePath = getProjectMainModuleFilePath();

	const mainModuleContents = fs.existsSync(projectMainModuleFilePath)
		? fs.readFileSync(projectMainModuleFilePath, 'utf8')
		: '';

	const previousDirRelPath = path.relative(
		path.dirname(filePath),
		path.dirname(projectMainModuleFilePath)
	);

	let {code} = await transformJsSource(
		{code: mainModuleContents},
		relocateImports(previousDirRelPath)
	);

	code += '\n';

	// Export project's main module for bridges (if it is present)

	if (fs.existsSync(projectMainModuleFilePath)) {
		const fileName = path.basename(projectMainModuleFilePath);

		code += `export * from './${previousDirRelPath}/${fileName}'\n`;
	}

	// Export internal dependencies for bridges

	let {bridges} = getMergedConfig('npmscripts', 'federation');

	bridges = bridges || [];

	for (const packageName of bridges) {
		const exportName = getBridgeExportName(packageName);

		code += `export * as ${exportName} from '${packageName}';\n`;
	}

	// Finally, write the file

	fs.writeFileSync(filePath, code);
};
