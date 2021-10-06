/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');

const {qaDir} = require('./resources');
const {deploy, generate, logStep, spawn} = require('./util');

const argv = getTargets();

if (argv['clean']) {
	logStep('Cleaning qa directory');

	spawn('git', ['checkout', '.'], {
		cwd: qaDir,
	});

	spawn('git', ['clean', '-dxf'], {
		cwd: qaDir,
	});
}

if (argv['generate']) {
	logStep('Generating test projects');

	generate('plain-js-portlet', 'Plain JavaScript');
	generate('react-portlet', 'React');
}

if (argv['deploy']) {
	logStep('Deploying test projects');

	fs.readdirSync(qaDir).forEach((projectDirName) => {
		deploy(projectDirName);
	});
}

function getTargets() {
	let argv = process.argv.slice(2);

	if (argv.length === 0) {
		argv = ['clean', 'generate', 'deploy'];
	}

	argv = argv.reduce((hash, val) => {
		hash[val] = true;

		return hash;
	}, {});

	return argv;
}
