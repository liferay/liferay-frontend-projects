/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

const generateSamples = require('./generate-samples');
const {
	lernaPath,
	linkJsToolkitPath,
	linkJsToolkitProjectDir,
	qaDir,
	samplesDir,
} = require('./resources');
const {logStep, safeUnlink, spawn} = require('./util');

const argv = getTargets();

if (argv['reset']) {
	logStep('Cleaning QA directories');
	spawn('git', ['checkout', '.'], {
		cwd: qaDir,
	});
	spawn('git', ['clean', '-dxf'], {
		cwd: qaDir,
	});
}

if (argv['generate']) {
	logStep('Generating sample projects');
	generateSamples();
}

if (argv['install']) {
	logStep('Installing dependencies and linking local JS Toolkit');

	safeUnlink(path.join(samplesDir, 'yarn.lock'));

	spawn('npm', ['install'], {
		cwd: linkJsToolkitProjectDir,
	});

	spawn('node', [linkJsToolkitPath, '-w'], {
		cwd: samplesDir,
	});
}

if (argv['deploy']) {
	// Deploy liferay portlets

	logStep('Deploying Liferay project samples');
	spawn('node', [lernaPath, 'run', 'deploy'], {
		cwd: samplesDir,
	});

	// Deploy adapted projects

	logStep('Deploying adapted project samples');
	spawn('node', [lernaPath, 'run', 'deploy:liferay'], {
		cwd: samplesDir,
		env: {
			...process.env,

			// This is necessary to avoid create-react-app failures because it
			// detects duplicated dependencies in the node_modules folder of the
			// toolkit project (which is up in FS of the `samples` folder)

			SKIP_PREFLIGHT_CHECK: 'true',
		},
	});
}

function getTargets() {
	let argv = process.argv.slice(2);

	if (argv.length === 0) {
		argv = ['reset', 'generate', 'install', 'deploy'];
	}

	argv = argv.reduce((hash, val) => {
		hash[val] = true;

		return hash;
	}, {});

	return argv;
}
