/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @liferay/no-dynamic-require, no-console */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const LOCAL_REGISTRY = 'http://localhost:4873';
const NPM_REGISTRY = 'https://registry.npmjs.org/';
const YARN_REGISTRY = 'https://registry.yarnpkg.com';

module.exports = function main(argv) {
	switch (argv._[0]) {
		case 'install':
		case 'i':
			install(argv.packagename);
			break;

		case 'publish':
		case 'p':
			publish(argv.projects || ['.']);
			break;

		case 'registry':
		case 'r':
			switch (argv._[1]) {
				case 'get':
				case 'g':
					registryGet();
					break;

				case 'set':
				case 's':
					registrySet(argv._[2]);
					break;

				default:
					break;
			}
			break;

		default:
			break;
	}
};

function assertLocalRepo() {
	const npmUrl = run('npm', 'get', 'registry');
	const yarnUrl = run('yarn', 'config', 'get', 'registry');

	if (npmUrl === NPM_REGISTRY || yarnUrl === YARN_REGISTRY) {
		console.log('');
		console.log('  🔴 NOT using LOCAL repo: refusing to do anything');
		console.log('');
		process.exit(1);
	}
}

function install(packageName) {
	assertLocalRepo();

	console.log('');

	const dir = path.join('node_modules', packageName);

	console.log(`  ⛔ Removing ${packageName} from node_modules`);
	if (fs.existsSync(dir)) {
		fs.rmdirSync(dir, {recursive: true});
	}

	console.log(`  ⛔ Removing ${packageName} from yarn cache`);
	run('yarn', 'cache', 'clean', packageName);

	console.log(`  👊 Forcing reinstallation of ${packageName}`);
	console.log('');
	run('yarn', 'add', packageName, '--force', '-O', {stdio: 'inherit'});

	console.log('');
	console.log('  🎉 All work done (exquisitely, we could say)');
	console.log('');
}

function publish(projects) {
	assertLocalRepo();

	projects = projects.map((name) => path.resolve(name));

	console.log('');

	projects.forEach((dir) => {
		const {name, version} = require(`${dir}/package.json`);
		const pkgId = `${name}@${version}`;

		console.log(`  ⛔ Unpublishing ${pkgId}`);
		run('npm', 'unpublish', pkgId);
		run('yarn', 'cache', 'clean', pkgId);
	});

	console.log('');

	projects.forEach((dir) => {
		const {name, version} = require(`${dir}/package.json`);
		const pkgId = `${name}@${version}`;

		console.log(`  🚀 Publishing ${pkgId}`);
		run('npm', 'publish', {cwd: dir});
	});

	console.log('');
}

function registryGet() {
	const npmUrl = run('npm', 'get', 'registry');
	const yarnUrl = run('yarn', 'config', 'get', 'registry');

	console.log('');

	if (npmUrl === NPM_REGISTRY && yarnUrl === YARN_REGISTRY) {
		console.log('  🌍 Using PUBLIC repo');
	}
	else if (npmUrl === NPM_REGISTRY) {
		console.log("  🔴 Using public npm repo, but local yarn (that's bad)");
	}
	else if (yarnUrl === YARN_REGISTRY) {
		console.log("  🔴 Using local npm repo, but remote yarn (that's bad)");
	}
	else {
		console.log('  🏠 Using LOCAL repo');
	}

	console.log('');
}

function registrySet(which) {
	let npmUrl = NPM_REGISTRY;
	let yarnUrl = YARN_REGISTRY;

	if (['local', 'l'].includes(which)) {
		npmUrl = yarnUrl = LOCAL_REGISTRY;
	}

	run('npm', 'set', 'registry', npmUrl);
	run('yarn', 'config', 'set', 'registry', yarnUrl);

	registryGet();
}

function run(cmd, ...args) {
	let options = {
		shell: true,
		stdio: 'pipe',
	};

	if (args.length && typeof args[args.length - 1] === 'object') {
		options = {
			...options,
			...args[args.length - 1],
		};
		args = args.slice(0, args.length - 1);
	}

	const result = childProcess.spawnSync(cmd, args, options);

	if (result.error) {
		console.error(result.error);
		console.error('  🔥 Execution failed; sorry');
		console.error();
		process.exit(1);
	}

	if (result.status !== 0) {
		console.error(result.stdout.toString());
		console.error(result.stderr.toString());
		console.error('  🔥 Execution failed; sorry');
		console.error();
		process.exit(result.status);
	}

	let out = (result.stdout || '').toString();

	if (out.endsWith('\n')) {
		out = out.substring(0, out.length - 1);
	}

	return out;
}
