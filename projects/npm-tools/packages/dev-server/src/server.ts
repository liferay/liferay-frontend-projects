/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import chalk from 'chalk';
import {spawn} from 'child_process';
import chokidar from 'chokidar';
import {Command} from 'commander';
import {existsSync} from 'fs';
import {mkdir, readFile, writeFile} from 'fs/promises';
import glob from 'glob';
import http from 'http';
import httpProxy from 'http-proxy';
import open from 'open';
import {tmpdir} from 'os';
import {dirname, resolve} from 'path';
import pkgUp from 'pkg-up';

import setupReload from './reload';
import title from './title';
import {getRequestLogger, log} from './util/log';

const IGNORED_PATHS = [
	'build',
	'classes',
	'node_modules',
	'sdk',
	'tmp',
	'types',
];
const WATCH_GLOB = '**/*.{css,js,jsx,scss,ts,tsx}';
const MODULE_REGEXP = /\/o\/(?<module>[^/]*)\/(?<file>[^?]*)/;
const RESOLVED_MODULE_REGEXP = /\/o\/js\/resolved-module\/(?<module>@?[^@]*)@(?<version>\d+\.\d+\.\d+)\/(?<file>[^?]*)/;

function isHTMLResponse(response: http.IncomingMessage) {
	return (
		response.headers &&
		response.headers['content-type']?.includes('text/html')
	);
}

async function getModulePaths(
	cwd: string,
	regenerate: boolean = false
): Promise<Map<string, string>> {
	const mappingsTmpDirPath = resolve(tmpdir(), 'liferay-dev-server');
	const mappingsTmpFilePath = resolve(mappingsTmpDirPath, 'mappings.json');

	if (!regenerate) {
		try {
			const paths = await (
				await readFile(mappingsTmpFilePath)
			).toString();

			return new Map(JSON.parse(paths));
		}
		catch (error) {
			log(
				chalk.blue(
					`Couldn't find mappings cache. Scanning ${cwd} for modules, this might take a while...`
				)
			);
		}
	}

	const modulePaths = new Map<string, string>();

	const modules = glob.sync('**/package.json', {
		cwd,
		ignore: IGNORED_PATHS.map((path) => `**/${path}/**`),
	});

	for (const module of modules) {
		const moduleInfo = JSON.parse(
			await (await readFile(resolve(cwd, module))).toString()
		);

		modulePaths.set(moduleInfo.name, resolve(cwd, dirname(module)));
	}

	if (!existsSync(mappingsTmpDirPath)) {
		await mkdir(mappingsTmpDirPath);
	}

	await writeFile(mappingsTmpFilePath, JSON.stringify([...modulePaths]));

	return modulePaths;
}

export default async function () {
	const LIVE_SESSIONS = new Set<http.ServerResponse>();
	let WD = '';

	const program = new Command();

	program
		.argument('<path>', 'Path to liferay-portal')
		.option('-p, --port <number>', 'Proxy Port', '3000')
		.option('-r, --regenerate', 'Regenerate module path cache', false)
		.option(
			'-u, --url <url>',
			'Liferay Portal URL',
			'http://localhost:8080'
		)
		.option('-v, --verbose', 'Output verbose', false)
		.action((path) => {
			WD = resolve(path);
		});

	const {port, regenerate, url, verbose} = program.parse(process.argv).opts();

	log(chalk.cyan(title));

	const modulePaths = await getModulePaths(WD, regenerate);

	if (verbose) {
		log(
			chalk.grey(
				`\nFound and mapped ${modulePaths.size} modules in ${WD}`
			)
		);
	}

	const proxy = httpProxy.createProxyServer({
		followRedirects: true,
		selfHandleResponse: true,
		target: url,
	});

	const fallback = (
		request: http.IncomingMessage,
		response: http.ServerResponse
	) => proxy.web(request, response);

	proxy.on('proxyRes', (proxyRes, request, response) => {
		const chunks: Uint8Array[] = [];

		Object.keys(proxyRes.headers).forEach((key) => {
			const value = proxyRes.headers[key];

			if (value) {
				response.setHeader(key, value);
			}
		});

		proxyRes.on('data', (chunk: Uint8Array) => {
			chunks.push(chunk);

			if (!isHTMLResponse(proxyRes)) {
				response.write(chunk);
			}
		});

		proxyRes.on('end', (chunk: Uint8Array) => {
			if (isHTMLResponse(proxyRes)) {
				response.end(setupReload(Buffer.concat(chunks).toString()));
			}
			else {
				response.end(chunk);
			}
		});
	});

	http.createServer(async (request, response) => {
		const requestLog = getRequestLogger(request);
		const url = request.url;

		if (!url) {
			return;
		}

		if (
			request.headers.accept &&
			request.headers.accept == 'text/event-stream'
		) {
			if (url === '/events') {
				log(chalk.cyan('Connecting Live Session...'));

				response.writeHead(200, {
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive',
					'Content-Type': 'text/event-stream',
				});

				response.write(`id: ${Date.now()}\ndata: connected\n\n`);

				LIVE_SESSIONS.add(response);
			}
		}
		else {
			const routableReq =
				RESOLVED_MODULE_REGEXP.exec(url) || MODULE_REGEXP.exec(url);

			if (routableReq && routableReq.groups) {
				const {file, module} = routableReq.groups;

				const modulePath = modulePaths.get(module);

				if (modulePath) {
					try {
						const data = await readFile(
							resolve(
								modulePath,
								'build/node/packageRunBuild/resources',
								file.endsWith('.css')
									? `.sass-cache/${file}`
									: file
							)
						);

						if (verbose) {
							requestLog(
								chalk.green(
									`Served to ${modulePath}/build/node/packageRunBuild/resources/${file}`
								)
							);
						}

						response.write(data);
						response.end();
					}
					catch (error) {
						try {
							const data = await readFile(
								resolve(
									modulePath,
									'tmp/META-INF/resources',
									file
								)
							);

							if (verbose) {
								requestLog(
									chalk.green(
										`Served ${request.url} to ${modulePath}/tmp/META-INF/resources/${file}`
									)
								);
							}

							response.write(data);
							response.end();
						}
						catch (error) {
							if (verbose) {
								requestLog(
									chalk.yellow(
										`Sending ${request.url} to main server`
									)
								);
							}

							fallback(request, response);
						}
					}
				}
				else {
					if (verbose) {
						requestLog(
							chalk.yellow(
								`Sending ${request.url} to main server`
							)
						);
					}

					fallback(request, response);
				}
			}
			else {
				if (verbose) {
					requestLog(
						chalk.yellow(`Sending ${request.url} to main server`)
					);
				}

				fallback(request, response);
			}
		}
	}).listen(port);

	log(chalk.green(`\nLiferay Dev Server is ready at http:127.0.0.1:${port}`));

	open(`http://127.0.0.1:${port}`);

	const watcher = chokidar.watch(`${WD}/modules/${WATCH_GLOB}`, {
		ignoreInitial: true,
		ignored: (path: string) =>
			IGNORED_PATHS.some((ignoredPath) => path.includes(ignoredPath)),
	});

	watcher.on('change', async (path) => {
		log(chalk.yellow(`\nDetected file change:\n    ${path}`));

		const moduleWD = dirname((await pkgUp({cwd: dirname(path)})) as string);

		log(chalk.yellow(`\nTriggering yarn build:\n    ${moduleWD}`));

		LIVE_SESSIONS.forEach((response) => {
			response.write(`id: ${Date.now()}\ndata: changes\n\n`);
		});

		const logger = (data: unknown) => log(chalk.grey(`\t ${data}`));

		const yarnBuild = spawn('yarn', ['build'], {
			cwd: moduleWD,
			env: {
				...process.env,
				NODE_ENV: 'development',
			},
		});

		yarnBuild.stdout.on('data', logger);
		yarnBuild.stderr.on('data', logger);

		yarnBuild.on('close', (code) => {
			if (!code) {
				log(
					chalk.green(
						`Build completed successfully, you can reload now to see your changes!`
					)
				);

				LIVE_SESSIONS.forEach((response) => {
					response.write(`id: ${Date.now()}\ndata: reload\n\n`);
				});
			}
		});

		yarnBuild.on('error', (error) => {
			log(chalk.red(error));
		});
	});

	log(chalk.green(`Watching changes at ${WD}/modules/${WATCH_GLOB}\n`));
}
