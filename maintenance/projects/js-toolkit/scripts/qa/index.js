/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const generateSamples = require('./generate-samples');
const {
	lernaPath,
	liferayDir,
	linkJsToolkitPath,
	linkJsToolkitProjectDir,
	projectsDir,
	qaDir,
	samplesDir,
} = require('./resources');
const {logStep, safeUnlink, spawn} = require('./util');

logStep('WARNING');
console.log(`
QA projects will be deployed to:


  ${liferayDir}


You can change this behavior creating a .generator-liferay-js.json file in your
home directory with the following content:

  {
    "answers": {
      "*": {
        "liferayDir": "/path/to/your/liferay/installation"
      }
    }
  }

`);

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

	fs.readdirSync(projectsDir).forEach((projectName) => {
		const projectDir = path.join(projectsDir, projectName);

		const pkgJson = fs.readJsonSync(path.join(projectDir, 'package.json'));

		if (pkgJson.bin) {
			Object.keys(pkgJson.bin).forEach((bin) =>
				safeUnlink(path.join(os.homedir(), '.yarn', 'bin', bin))
			);
		}

		safeUnlink(
			path.join(os.homedir(), '.config', 'yarn', 'link', projectName)
		);

		spawn('yarn', ['link'], {cwd: projectDir});
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

	logStep('Process finished');
	console.log(`
The following projects have been deployed to your local Liferay installation:

${fs
	.readdirSync(path.join(samplesDir, 'packages'))
	.filter((dirname) =>
		fs.statSync(path.join(samplesDir, 'packages', dirname)).isDirectory()
	)
	.filter((dirname) =>
		fs.existsSync(
			path.join(samplesDir, 'packages', dirname, 'package.json')
		)
	)
	.filter((dirname) => {
		const pkgJson = fs.readJsonSync(
			path.join(samplesDir, 'packages', dirname, 'package.json')
		);

		return (
			pkgJson['scripts']['deploy'] || pkgJson['scripts']['deploy:liferay']
		);
	})
	.map((dirname) => `  · ${dirname}`)
	.join('\n')}


You can find them under portlet category: JS Toolkit QA


Remember that we have used your Liferay installation at:

	${liferayDir}


	`);
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
