/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const chalk = require('chalk');
const {Command} = require('commander');
const {readFileSync} = require('fs');
const glob = require('glob');
const {dirname, resolve} = require('path');

const log = require('./util/log');

const IGNORED_GLOBS = [
	'**/node_modules/**',
	'**/classes/**',
	'**/tmp/**',
	'**/build/**',
	'**/sdk/**',
];

module.exports = async function () {
	const MODULE_PATHS = {};
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

	log(chalk.cyan(require('./title')));

	log(chalk.blue(`Scanning ${WD} for modules, this might take a while...\n`));

	const modules = glob.sync('**/package.json', {
		cwd: WD,
		ignore: IGNORED_GLOBS,
	});

	modules.forEach((module) => {
		const moduleInfo = JSON.parse(readFileSync(resolve(WD, module)));

		MODULE_PATHS[moduleInfo.name] = resolve(
			WD,
			dirname(module),
			'build/node/packageRunBuild/resources'
		);
	});

	if (verbose) {
		log(chalk.grey(`Found and mapped ${modules.length} modules in ${WD}`));
	}
};
