/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

/**
 * Filters unwanted dependencies from a module's metadata to simplify the final report.
 */
function prepareModule(dependencies) {
	const simpleModule = {};

	Object.keys(dependencies)
		.filter(key => dependencies[key] && dependencies[key].length)
		.forEach(key => {
			simpleModule[key] = dependencies[key];
		});

	return simpleModule;
}

/**
 * Saves a `json` file in the current working directory with the dependencies
 * report.
 *
 * Modules will be grouped within their application and the report will only show the groups that are actually depended upon rather than all of them. For example, if a module does not have any dependency on Clay3, the `clay3` field won't show up in the report.
 */
module.exports = async function(modulesInfo, {name}) {
	const modulesJSON = modulesInfo
		.filter(moduleInfo => moduleInfo.dependencies)
		.reduce((acc, {app, dependencies, name}) => {
			const moduleData = {
				name,
				...prepareModule(dependencies)
			};

			acc[app] = acc[app] || {modules: []};
			acc[app].modules = [...acc[app].modules, moduleData];

			return acc;
		}, {});

	await writeFile(`${name}.json`, JSON.stringify(modulesJSON));
};
