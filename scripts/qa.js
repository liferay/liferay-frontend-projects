/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const qaDir = path.join(__dirname, '..', 'qa');
const samplesDir = path.join(qaDir, 'samples');
const devtoolsDir = path.join(__dirname, '..', 'resources', 'devtools');

let argv = process.argv.slice(2);

if (argv.length == 0) {
	argv = ['generate', 'install', 'deploy'];
}

argv = argv.reduce((hash, val) => {
	hash[val] = true;
	return hash;
}, {});

if (argv['generate']) {
	childProcess.spawnSync('node', [path.join(qaDir, 'generate-samples.js')], {
		stdio: 'inherit',
		cwd: qaDir,
		shell: true,
	});
}

if (argv['install']) {
	try {
		fs.unlinkSync(path.join(samplesDir, 'yarn.lock'));
	} catch (err) {
		// swallow
	}

	childProcess.spawnSync('yarn', ['install'], {
		stdio: 'inherit',
		cwd: samplesDir,
		shell: true,
	});

	childProcess.spawnSync(
		'node',
		[path.join(devtoolsDir, 'link-js-toolkit', 'link-js-toolkit.js')],
		{
			stdio: 'inherit',
			cwd: samplesDir,
			shell: true,
		}
	);
}

if (argv['deploy']) {
	const env = {
		// This is necessary to avoid create-react-app failures because it
		// detects duplicated dependencies in the node_modules folder of the
		// toolkit project (which is up in FS of the `samples` folder)
		SKIP_PREFLIGHT_CHECK: 'true',
	};

	childProcess.spawnSync('lerna', ['run', 'deploy'], {
		stdio: 'inherit',
		cwd: samplesDir,
		shell: true,
		env,
	});

	childProcess.spawnSync('lerna', ['run', 'deploy:liferay'], {
		stdio: 'inherit',
		cwd: samplesDir,
		shell: true,
		env,
	});
}
