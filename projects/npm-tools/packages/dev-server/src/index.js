/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const chalk = require('chalk');
const {spawn} = require('child_process');
const chokidar = require('chokidar');
const {Command} = require('commander');
const {readFile, readFileSync} = require('fs');
const glob = require('glob');
const http = require('http');
const httpProxy = require('http-proxy');
const open = require('open');
const {dirname, resolve} = require('path');
const pkgUp = require('pkg-up');

const log = require('./util/log');

const IGNORED_PATHS = [
	'build',
	'classes',
	'node_modules',
	'sdk',
	'tmp',
	'types',
];
const WATCH_GLOB = '**/*.{js,jsx,ts,tsx}';
const MODULE_REGEXP = /\/o\/(?<module>[^/]*)\/(?<file>[^?]*)/;
const RESOLVED_MODULE_REGEXP = /\/o\/js\/resolved-module\/(?<module>@?[^@]*)@(?<version>\d\.\d\.\d)\/(?<file>[^?]*)/;

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

	log(chalk.blue(`Scanning ${WD} for modules, this might take a while...`));

	const modules = glob.sync('**/package.json', {
		cwd: WD,
		ignore: IGNORED_PATHS.map((path) => `**/${path}/**`),
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
		log(
			chalk.grey(`\nFound and mapped ${modules.length} modules in ${WD}`)
		);
	}

	const proxy = httpProxy.createProxyServer({
		target: url,
	});

	const fallback = (req, res) => proxy.web(req, res);

	http.createServer((req, res) => {
		const routableReq =
			RESOLVED_MODULE_REGEXP.exec(req.url) || MODULE_REGEXP.exec(req.url);

		if (routableReq) {
			const {file, module} = routableReq.groups;

			if (MODULE_PATHS[module]) {
				readFile(resolve(MODULE_PATHS[module], file), (error, data) => {
					if (!error) {
						if (verbose) {
							log(
								chalk.green(
									`Served ${req.url} to ${MODULE_PATHS[module]}/${file}`
								)
							);
						}

						res.write(data);
						res.end();
					}
					else {
						if (verbose) {
							log(
								chalk.yellow(
									`File ${resolve(
										MODULE_PATHS[module],
										file
									)} not found`
								)
							);
						}

						fallback(req, res);
					}
				});
			}
			else {
				fallback(req, res);
			}
		}
		else {
			fallback(req, res);
		}
	}).listen(port);

	log(chalk.green(`\nLiferay Dev Server is ready at http:127.0.0.1:${port}`));

	open(`http://127.0.0.1:${port}`);

	const watcher = chokidar.watch(`${WD}/modules/${WATCH_GLOB}`, {
		ignoreInitial: true,
		ignored: (path) =>
			IGNORED_PATHS.some((ignoredPath) => path.includes(ignoredPath)),
	});

	watcher.on('change', async (path) => {
		log(chalk.blue(`\nDetected file change: ${path}`));

		const moduleWD = dirname(await pkgUp({cwd: dirname(path)}));

		log(chalk.blue(`Triggering yarn build from ${moduleWD}`));

		const logger = (data) => log(chalk.grey(`\t ${data}`));

		const yarnBuild = spawn('yarn', ['build'], {cwd: moduleWD});

		yarnBuild.stdout.on('data', logger);
		yarnBuild.stderr.on('data', logger);

		yarnBuild.on('close', (code) => {
			if (!code) {
				log(
					chalk.green(
						`Build completed successfully, you can reload now to see your changes!`
					)
				);
			}
		});

		yarnBuild.on('error', (error) => {
			log(chalk.red(error));
		});
	});

	log(chalk.green(`\nWatching changes at ${WD}/modules/${WATCH_GLOB}`));
};
