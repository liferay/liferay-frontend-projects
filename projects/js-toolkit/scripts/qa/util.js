/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const {liferayCliPath, liferayDir, qaDir, tmpDir} = require('./resources');

function deploy(projectDirName) {
	logStep(`DEPLOY: ${projectDirName}`);

	const projectDir = path.join(qaDir, projectDirName);

	const pkgJson = JSON.parse(
		fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8')
	);

	const {scripts} = pkgJson;

	if (!scripts) {
		return;
	}

	let buildScript;
	let deployScript;

	if (scripts['deploy']) {
		deployScript = 'deploy';
		buildScript = 'build';
	}
	else if (scripts['deploy:liferay']) {
		deployScript = 'deploy:liferay';
		buildScript = 'build:liferay';
	}

	if (!deployScript) {
		return;
	}

	spawn('yarn', [], {
		cwd: projectDir,
	});

	if (buildScript) {
		spawn('yarn', [buildScript], {
			cwd: projectDir,
		});
	}

	spawn('yarn', [deployScript], {
		cwd: projectDir,
	});
}

function generate(projectDirName, platform, framework) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	runLiferayCli(qaDir, ['new', projectDirName], {
		framework,
		platform,
	});

	writeLiferayJsonFile(projectDirName);
}

function generateAngularCli(projectDirName) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	spawn(
		'npx',
		[
			'@angular/cli@12.2.10',
			'new',
			projectDirName,
			'--defaults',
			'--skip-install',
		],
		{
			cwd: qaDir,
		}
	);

	const projectDir = path.join(qaDir, projectDirName);

	runLiferayCli(projectDir, ['adapt'], {});

	writeLiferayJsonFile(projectDirName);
}

function generateCreateReactApp(projectDirName) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	spawn('npx', ['create-react-app@4.0.3', projectDirName], {
		cwd: qaDir,
	});

	const projectDir = path.join(qaDir, projectDirName);

	runLiferayCli(projectDir, ['adapt'], {});

	writeLiferayJsonFile(projectDirName);

	fs.writeFileSync(
		path.join(projectDir, '.env'),
		'SKIP_PREFLIGHT_CHECK=true',
		'utf8'
	);
}

function generateVueCli(projectDirName) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	spawn(
		'npx',
		['@vue/cli@4.5.14', 'create', projectDirName, '-d', '-m', 'yarn'],
		{
			cwd: qaDir,
		}
	);

	const projectDir = path.join(qaDir, projectDirName);

	runLiferayCli(projectDir, ['adapt'], {});

	writeLiferayJsonFile(projectDirName);
}

function logStep(step) {
	console.log(`
********************************************************************************
* ${step}
********************************************************************************
`);
}

function runLiferayCli(dir, args, options) {
	const optionsFilePath = path.join(tmpDir, 'options.json');

	fs.writeFileSync(optionsFilePath, JSON.stringify(options));

	const argv = [
		liferayCliPath,
		...args,
		'--batch',
		'--options',
		optionsFilePath,
	];

	spawn('node', argv, {
		cwd: dir,
	});
}

function spawn(cmd, args, options = {}) {
	const proc = childProcess.spawnSync(cmd, args, {
		cwd: path.join('..', '..'),
		shell: true,
		stdio: 'inherit',
		...options,
	});

	if (proc.error || proc.status !== 0) {
		process.exit(1);
	}
}

function writeLiferayJsonFile(projectDirName) {
	fs.writeFileSync(
		path.join(qaDir, projectDirName, '.liferay.json'),
		JSON.stringify({
			deploy: {
				path: liferayDir,
			},
		})
	);
}

function zapProjectDir(projectDirName) {
	fs.rmdirSync(path.join(qaDir, projectDirName), {recursive: true});
}

module.exports = {
	deploy,
	generate,
	generateAngularCli,
	generateCreateReactApp,
	generateVueCli,
	logStep,
	spawn,
};
