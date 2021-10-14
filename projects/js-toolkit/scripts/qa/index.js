/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');

const {qaDir} = require('./resources');
const {
	deploy,
	generate,
	generateAngularCli,
	generateCreateReactApp,
	generateVueCli,
	logStep,
	spawn,
} = require('./util');

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

	generate('agnostic-angular-portlet', 'portal-agnostic', 'Angular');
	generate(
		'agnostic-plain-js-portlet',
		'portal-agnostic',
		'Plain JavaScript'
	);
	generate('agnostic-react-portlet', 'portal-agnostic', 'React');
	generate('agnostic-vuejs-portlet', 'portal-agnostic', 'Vue.js');

	generate('master-angular-portlet', 'portal-master', 'Angular');
	generate('master-plain-js-portlet', 'portal-master', 'Plain JavaScript');
	generate('master-react-portlet', 'portal-master', 'React');
	generate('master-vuejs-portlet', 'portal-master', 'Vue.js');

	generateAngularCli('angular-cli-portlet');
	generateCreateReactApp('create-react-app-portlet');
	generateVueCli('vue-cli-portlet');
}

if (argv['deploy']) {
	logStep('Deploying test projects');

	fs.readdirSync(qaDir, {withFileTypes: true}).forEach((dirent) => {
		if (!dirent.isDirectory()) {
			return;
		}

		deploy(dirent.name);
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
