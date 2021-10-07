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
	const projectDir = path.join(qaDir, projectDirName);

	const pkgJson = JSON.parse(
		fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8')
	);

	if (!pkgJson.scripts || !pkgJson.scripts.deploy) {
		return;
	}

	spawn('yarn', [], {
		cwd: projectDir,
	});
	spawn('yarn', ['build'], {
		cwd: projectDir,
	});
	spawn('yarn', ['deploy'], {
		cwd: projectDir,
	});
}

function generate(projectDirName, framework) {
	const optionsFilePath = path.join(tmpDir, 'options.json');

	fs.writeFileSync(
		optionsFilePath,
		JSON.stringify({
			framework,
			platform: 'portal-master',
		})
	);

	const projectDir = path.join(qaDir, projectDirName);

	fs.rmdirSync(projectDir, {recursive: true});

	spawn(
		'node',
		[
			liferayCliPath,
			'new',
			projectDirName,
			'--batch',
			'--options',
			optionsFilePath,
		],
		{
			cwd: qaDir,
		}
	);

	fs.writeFileSync(
		path.join(projectDir, '.liferay.json'),
		JSON.stringify({
			deploy: {
				path: liferayDir,
			},
		})
	);
}

function logStep(step) {
	console.log(`
********************************************************************************
* ${step}
********************************************************************************
`);
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

module.exports = {
	deploy,
	generate,
	logStep,
	spawn,
};
