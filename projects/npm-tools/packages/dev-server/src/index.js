/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const chalk = require('chalk');
const {Command} = require('commander');
const {resolve} = require('path');

module.exports = async function () {
	let WD;

	const program = new Command();

	program
		.argument('<path>', 'Path to liferay-portal')
		.option('-p, --port <number>', 'Proxy Port', 3000)
		.option(
			'-u, --url <url>',
			'Liferay Portal URL',
			'http://localhost:8080'
		)
		.option('-v, --verbose', 'Output verbose', false)
		.action((path) => {
			WD = resolve(path);
		});

	const {port, url, verbose} = program.parse(process.argv).opts();

	// eslint-disable-next-line no-console
	console.log(chalk.cyan(require('./title')));
};
