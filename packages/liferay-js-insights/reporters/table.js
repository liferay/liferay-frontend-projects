/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Table = require('cli-table');

/**
 * Prints the modules's insights report as a table in the terminal. By default, it only includes the `app`, `module`, `clay3` and `react` fields for brevity.
 */
module.exports = async function(modulesInfo) {
	const table = new Table({
		colWidths: [35, 35, 50, 70],
		head: ['app', 'module', 'clay3', 'react']
	});

	modulesInfo
		.filter(moduleInfo => moduleInfo.dependencies)
		.map(({app, name, dependencies}) => [
			app,
			name,
			dependencies.clay3,
			dependencies.react
		])
		.forEach(moduleInfo => table.push(moduleInfo));

	// eslint-disable-next-line no-console
	console.log(table.toString());
};
