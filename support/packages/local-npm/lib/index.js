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
					registryGet(argv.bashPrompt);
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
	const npmUrl = run('npm', 'get', '-g', 'registry', {log: false});
	const yarnUrl = run('yarn', 'config', 'get', 'registry', {log: false});

	if (npmUrl === NPM_REGISTRY || yarnUrl === YARN_REGISTRY) {
		console.log(
			'\n  🔴 NOT using LOCAL registry: refusing to do anything\n'
		);
		process.exit(1);
	}
}

function install(packageName) {
	assertLocalRepo();

	console.log('');

	console.log(`  ⛔ Removing ${packageName} from yarn cache`);
	run('yarn', 'cache', 'clean', packageName);

	const nodeModulesDir = path.join('node_modules', packageName);

	console.log(`  ⛔ Removing ${packageName} from node_modules`);
	if (fs.existsSync(nodeModulesDir)) {
		console.log(`       > rm -rf ${nodeModulesDir}`);
		fs.rmSync(nodeModulesDir, {recursive: true});
	}

	if (fs.existsSync('source-formatter.properties')) {
		const nodeModulesCacheDir = path.join('node_modules_cache');

		const particle = packageName.startsWith('@')
			? packageName.split('/')[1]
			: packageName;

		console.log(`  ⛔ Removing ${packageName} from node_modules_cache`);
		fs.readdirSync(nodeModulesCacheDir)
			.filter((fileName) => fileName.includes(particle))
			.forEach((fileName) => {
				console.log(`       > rm ${fileName}`);
				fs.unlinkSync(path.join(nodeModulesCacheDir, fileName));
			});

		console.log(`  👊 Forcing reinstallation of ${packageName}`);

		run('git', 'checkout', 'yarn.lock');

		const pkgJson = require(path.resolve('./package.json'));

		pkgJson.dependencies = pkgJson.dependencies || {};
		pkgJson.devDependencies = pkgJson.devDependencies || {};

		const version =
			pkgJson.dependencies[packageName] ||
			pkgJson.devDependencies[packageName] ||
			'latest';

		run(
			'yarn',
			'add',
			`${packageName}@${version}`,
			'--force',
			'-O',
			'-W',
			'--update-checksums'
		);
	}
	else {
		console.log(`  👊 Forcing reinstallation of ${packageName}\n`);
		run('yarn', 'add', packageName, '--force', '-O', '--update-checksums', {
			stdio: 'inherit',
		});
	}

	console.log('\n  🎉 All work done (exquisitely, we could say)\n');
}

function publish(projects) {
	assertLocalRepo();

	projects = projects.map((name) => path.resolve(name));

	console.log('\n  ⛔ Unpublishing:');

	projects.forEach((dir) => {
		const {name, version} = require(`${dir}/package.json`);
		const pkgId = `${name}@${version}`;

		console.log(`       ${pkgId}`);

		run('npm', 'unpublish', pkgId, '--force', {lenient: true, log: false});
		run('yarn', 'cache', 'clean', pkgId, {log: false});
	});

	console.log('\n  🚀 Publishing:');

	projects.forEach((dir) => {
		const {name, version} = require(`${dir}/package.json`);
		const pkgId = `${name}@${version}`;

		console.log(`       ${pkgId}`);

		run('npm', 'publish', {cwd: dir, log: false});
	});

	console.log('');
}

function registryGet(bashPrompt) {
	const npmUrl = run('npm', 'get', '-g', 'registry', {
		log: false,
	});
	const yarnUrl = run('yarn', 'config', 'get', 'registry', {log: false});

	if (npmUrl === NPM_REGISTRY && yarnUrl === YARN_REGISTRY) {
		if (bashPrompt) {
			process.stdout.write('🌍');
		}
		else {
			console.log('\n  🌍 Using PUBLIC registry\n');
		}
	}
	else if (npmUrl === NPM_REGISTRY) {
		if (bashPrompt) {
			process.stdout.write('😱');
		}
		else {
			console.log(
				"\n  🔴 Using public npm registry, but local yarn (that's bad)\n"
			);
		}
	}
	else if (yarnUrl === YARN_REGISTRY) {
		if (bashPrompt) {
			process.stdout.write('😱');
		}
		else {
			console.log(
				"\n  🔴 Using local npm registry, but remote yarn (that's bad)\n"
			);
		}
	}
	else {
		if (bashPrompt) {
			process.stdout.write('🏠');
		}
		else {
			console.log('\n  🏠 Using LOCAL registry\n');
		}
	}
}

function registrySet(which) {
	if (['local', 'l'].includes(which)) {
		run('npm', 'set', '-g', 'registry', LOCAL_REGISTRY, {
			log: false,
		});
		run('yarn', 'config', 'set', 'registry', LOCAL_REGISTRY, {log: false});
	}
	else {
		run('npm', 'config', 'rm', '-g', 'registry', {log: false});
		run('yarn', 'config', 'delete', 'registry', {log: false});
	}

	registryGet();
}

function run(cmd, ...args) {
	let options = {
		lenient: false, // set to true to ignore error return codes
		log: true, // show a console.log of execution
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

	if (options.log) {
		console.log('       >', cmd, ...args);
	}

	const result = childProcess.spawnSync(cmd, args, options);

	if (result.error) {
		console.error(result.error);
		console.error('  🔥 Execution failed; sorry');
		console.error();
		process.exit(1);
	}

	if (!options.lenient && result.status !== 0) {
		if (result.stdout) {
			console.error(result.stdout.toString());
			console.error(result.stderr.toString());
		}

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
