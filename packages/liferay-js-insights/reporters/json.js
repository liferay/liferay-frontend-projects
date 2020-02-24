/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

/**
 * Filters unwanted dependencies from a module's metadata to simplify the final report.
 */
function prepareModule(dependencies) {
	const simpleModule = {
		dependencies: {}
	};

	Object.keys(dependencies)
		.filter(key => dependencies[key] && dependencies[key].length)
		.forEach(key => {
			simpleModule.dependencies[key] = dependencies[key];
		});

	return simpleModule;
}

/**
 * Saves a `json` file in the current working directory with the dependencies
 * report.
 *
 * Modules will be grouped within their application and the report will only show the groups that are actually depended upon rather than all of them. For example, if a module does not have any dependency on Clay3, the `clay3` field won't show up in the report.
 */
module.exports = async function(modulesInfo, {output}) {
	const modulesJSON = modulesInfo
		.filter(moduleInfo => moduleInfo.dependencies)
		.reduce((acc, {dependencies, meta}) => {
			const moduleData = {
				name: meta.name,
				...prepareModule(dependencies)
			};

			acc[meta.app] = acc[meta.app] || {modules: []};
			acc[meta.app].modules = [...acc[meta.app].modules, moduleData];

			return acc;
		}, {});

	const json = JSON.stringify(modulesJSON, null, 2);

	if (output) {
		await writeFile(`${output}.json`, json);
	} else {
		process.stdout.write(json);
	}
};
