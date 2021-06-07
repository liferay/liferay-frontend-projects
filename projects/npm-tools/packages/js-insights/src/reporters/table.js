/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Table = require('cli-table');

const DEFAULT_CONFIG = {
	output: 'meta.app,meta.name,dependencies.clay3,dependencies.react',
};

/**
 * Traverses an object provided a path to a property and returns its value if found or null if the path can't be reached.
 */
const index = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);

/**
 * Prints the modules's insights report as a table in the terminal.
 */
module.exports = async function (modulesInfo, config) {
	const {output} = {
		...DEFAULT_CONFIG,
		...config,
	};

	const head = output.split(',');

	const colWidths = new Array(head.length).fill(
		Math.floor(190 / head.length)
	);

	const table = new Table({colWidths, head});

	modulesInfo
		.map((moduleInfo) =>
			head.map((field) => index(field.split('.'), moduleInfo) || '')
		)
		.forEach((moduleInfo) => table.push(moduleInfo));

	// eslint-disable-next-line no-console
	console.log(table.toString());
};
