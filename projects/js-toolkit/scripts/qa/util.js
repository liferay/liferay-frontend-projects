/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const {liferayCliPath, liferayDir, testDir, tmpDir} = require('./resources');

function build(projectDirName) {
	withNodeEnv('production', () => {
		runScript(projectDirName, 'build');
	});
}

function deploy(projectDirName) {
	withNodeEnv('production', () => {
		runScript(projectDirName, 'deploy');
	});
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
			'--skip-git',
			'--skip-install',
			'--directory',
			projectDirName,
		],
		{
			cwd: testDir,
		}
	);

	const projectDir = path.join(testDir, projectDirName);

	runLiferayCli(projectDir, ['adapt'], {});

	writeLiferayJsonFile(projectDirName);
}

function generateCreateReactApp(projectDirName) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	spawn('npx', ['create-react-app@^5.0.0', projectDirName], {
		cwd: testDir,
	});

	const projectDir = path.join(testDir, projectDirName);

	runLiferayCli(projectDir, ['adapt'], {});

	writeLiferayJsonFile(projectDirName);

	fs.writeFileSync(
		path.join(projectDir, '.env'),
		'SKIP_PREFLIGHT_CHECK=true',
		'utf8'
	);
}

function generatePortlet(projectDirName, platform, projectType) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	runLiferayCli(testDir, ['new', projectDirName], {
		platform,
		projectType,
		target: 'Liferay Platform Project',
	});

	writeLiferayJsonFile(projectDirName);
}

function generateRemoteApp(projectDirName, platform) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	runLiferayCli(testDir, ['new', projectDirName], {
		platform,
		target: 'Liferay Remote App Project',
	});

	writeLiferayJsonFile(projectDirName);
}

function generateThemeSpritemapClientExtension(
	projectDirName,
	extendClay = false
) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	fs.mkdirSync(path.join(testDir, projectDirName));

	fs.mkdirSync(path.join(testDir, projectDirName, 'src'));

	fs.writeFileSync(
		path.join(testDir, projectDirName, 'src', 'cog.svg'),
		'<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path class="lexicon-icon-outline" d="M451.1,280.9c2.3-15.5-0.5-39.3-1.9-50.1l48.5-32.2c13.4-9.3,17.6-27.1,9.9-41.4l-35.7-63c-7.9-14.7-25.7-20.8-41-14.2l-51.2,23.5c-12.9-10.4-34.3-21.9-49.9-28l-6.7-47.9C320.9,11.8,307.3,0,291.3,0l-70,0c-16.1,0-29.6,11.9-31.8,27.7l-6.5,46.9c-18.5,7.7-36.9,19.1-50.3,29.1L82.7,79.5c-14.7-5.8-30.4-4.5-38.4,9.2l-39.8,61c-7.9,13.4-4.9,30.5,7,40.6l50.3,40.2c-1.6,11.7-3,35.2-0.6,50.9l-47.4,32.6c-13.5,9.5-17.6,27.7-9.5,42l38.9,64.5c8.2,14.3,26,20.1,41.1,13.4l48.4-25.7c13.2,10.2,34.5,23.2,50.2,29.3l5.7,46.2c1.9,16.1,15.5,28.2,31.8,28.3l72.1,0.2c16.3,0,30-12.1,31.9-28.2l5.3-46.9c18.7-7.5,37.2-17.4,50.4-27.8l52.7,21.7c15.4,7.2,33.8,1.2,41.9-13.7l33.6-60.1c7.6-14.1,3.7-31.6-9.3-41L451.1,280.9z M256.4,343.4c-103.7,0-110.4-160,0-160C365.1,183.4,360.1,343.4,256.4,343.4z M504.1,318.2 M83.7,75.1" /></svg>'
	);

	fs.writeFileSync(
		path.join(testDir, projectDirName, 'package.json'),
		JSON.stringify({
			dependencies: {
				'@liferay/dxp-7.4': '*',
			},
			description: 'Sample Theme Spritemap',
			name: projectDirName,
			scripts: {
				build: 'liferay build',
				clean: 'liferay clean',
				deploy: 'liferay deploy',
			},
			version: '1.0.0',
		})
	);

	fs.writeFileSync(
		path.join(testDir, projectDirName, 'liferay.json'),
		JSON.stringify({
			build: {
				options: {
					extendClay,
				},
				type: 'themeSpritemap',
			},
		})
	);
}

function generateVueCli(projectDirName) {
	logStep(`GENERATE: ${projectDirName}`);

	zapProjectDir(projectDirName);

	spawn(
		'npx',
		['@vue/cli@4.5.14', 'create', projectDirName, '-d', '-n', '-m', 'yarn'],
		{
			cwd: testDir,
		}
	);

	const projectDir = path.join(testDir, projectDirName);

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

function runScript(projectDirName, baseScriptName) {
	const projectDir = path.join(testDir, projectDirName);

	const pkgJson = JSON.parse(
		fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8')
	);

	const {scripts} = pkgJson;

	if (!scripts) {
		return;
	}

	let script;

	if (scripts[`${baseScriptName}:liferay`]) {
		script = `${baseScriptName}:liferay`;
	}
	else if (scripts[baseScriptName]) {
		script = baseScriptName;
	}

	if (!script) {
		return;
	}

	logStep(`${baseScriptName.toUpperCase()}: ${projectDirName}`);

	withNodeEnv('development', () => {
		spawn('yarn', [], {
			cwd: projectDir,
		});
	});

	console.log(projectDir, script);

	spawn('yarn', [script], {
		cwd: projectDir,
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

function withNodeEnv(nodeEnv, callback) {
	const oldNODE_ENV = process.env.NODE_ENV;

	try {
		process.env.NODE_ENV = nodeEnv;
		callback();
	}
	finally {
		process.env.NODE_ENV = oldNODE_ENV;
	}
}

function writeLiferayJsonFile(projectDirName) {
	fs.writeFileSync(
		path.join(testDir, projectDirName, '.liferay.json'),
		JSON.stringify({
			deploy: {
				path: liferayDir,
			},
		})
	);
}

function zapProjectDir(projectDirName) {
	const rmdirSync = fs.rmSync || fs.rmdirSync;

	try {
		rmdirSync(path.join(testDir, projectDirName), {recursive: true});
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}
}

module.exports = {
	build,
	deploy,
	generateAngularCli,
	generateCreateReactApp,
	generatePortlet,
	generateRemoteApp,
	generateThemeSpritemapClientExtension,
	generateVueCli,
	logStep,
	spawn,
	withNodeEnv,
};
