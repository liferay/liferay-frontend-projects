/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');

const check = require('./check');
const {jsToolkitPath, qaDir} = require('./resources');
const {
	build,
	deploy,
	generateAngularCli,
	generateCreateReactApp,
	generatePortlet,
	generateRemoteApp,
	generateVueCli,
	logStep,
	spawn,
} = require('./util');

const argv = getTargets();

if (argv['prepare']) {
	logStep('Preparing things');

	['', 'clean', 'build'].forEach((target) =>
		spawn('yarn', [target], {
			cwd: jsToolkitPath,
		})
	);
}

if (argv['clean']) {
	logStep('Cleaning qa directory');

	spawn('git', ['checkout', '.'], {
		cwd: qaDir,
	});

	spawn('git', ['clean', '-dxf', '-e', 'expected'], {
		cwd: qaDir,
	});
}

if (argv['generate']) {
	logStep('Generating test projects');

	// Portlets

	generatePortlet('agnostic-angular-portlet', 'portal-agnostic', 'Angular');
	generatePortlet(
		'agnostic-plain-js-portlet',
		'portal-agnostic',
		'Plain JavaScript'
	);
	generatePortlet('agnostic-react-portlet', 'portal-agnostic', 'React');
	generatePortlet(
		'agnostic-shared-bundle',
		'portal-agnostic',
		'Shared bundle'
	);
	generatePortlet('agnostic-vuejs-portlet', 'portal-agnostic', 'Vue.js');

	//	generatePortlet('master-angular-portlet', 'portal-master', 'Angular');
	//	generatePortlet('master-plain-js-portlet', 'portal-master', 'Plain JavaScript');
	//	generatePortlet('master-react-portlet', 'portal-master', 'React');
	//	generatePortlet('master-shared-bundle', 'portal-master', 'Shared bundle');
	//	generatePortlet('master-vuejs-portlet', 'portal-master', 'Vue.js');

	// Remote Apps

	generateRemoteApp('agnostic-remote-app', 'portal-agnostic');

	// Adaptations

	generateAngularCli('angular-cli-portlet');
	generateCreateReactApp('create-react-app-portlet');
	generateVueCli('vue-cli-portlet');
}

if (argv['build']) {
	logStep('Building test projects');

	forEachProject(build);
}

if (argv['check']) {
	logStep('Checking test projects');

	forEachProject(check);
}

if (argv['deploy']) {
	logStep('Deploying test projects');

	forEachProject(deploy);
}

function forEachProject(fn) {
	fs.readdirSync(qaDir, {withFileTypes: true}).forEach((dirent) => {
		if (!dirent.isDirectory()) {
			return;
		}

		if (dirent.name === 'expected') {
			return;
		}

		fn(dirent.name);
	});
}

function getTargets() {
	let argv = process.argv.slice(2);

	if (!argv.length) {
		argv = ['prepare', 'clean', 'generate', 'build', 'check', 'deploy'];
	}

	argv = argv.reduce((hash, val) => {
		hash[val] = true;

		return hash;
	}, {});

	return argv;
}
