/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {red} = require('chalk');

const version = process.argv[3];

if (version === undefined) {
	console.error(
		red(`
❌ Please specify version number as an argument to the script
`)
	);
	process.exit(1);
}

module.exports = {
	files: ['packages/*/package.json'],
	from: [/"liferay-theme-tasks": ".*"/g, /'liferay-theme-tasks': '.*'/g],
	to: [
		`"liferay-theme-tasks": "^${version}"`,
		`'liferay-theme-tasks': '^${version}'`,
	],
};
