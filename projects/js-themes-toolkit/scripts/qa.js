/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable no-console, @liferay/no-dynamic-require */

const childProcess = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const {argv} = require('yargs');

const projectDir = path.resolve(__dirname, '..');
const workDir = path.join(projectDir, 'qa');
const pkgsDir = path.join(workDir, 'packages');
const yoPath = path.join(workDir, 'node_modules', '.bin', 'yo');
const generatorsPath = path.join(
	projectDir,
	'packages',
	'generator-liferay-theme',
	'generators'
);
const generatorPath = path.join(generatorsPath, 'app', 'index.js');
const classicGeneratorPath = path.join(generatorsPath, 'classic', 'index.js');
const adminGeneratorPath = path.join(generatorsPath, 'admin', 'index.js');
const themeletGeneratorPath = path.join(generatorsPath, 'themelet', 'index.js');
const layoutGeneratorPath = path.join(generatorsPath, 'layout', 'index.js');

checkPrerrequisites();
generateSamples();
runYarnInstall();
deployProjects();

// TASKS ///////////////////////////////////////////////////////////////////////

function checkPrerrequisites() {
	if (!fs.existsSync(path.join('/opt', 'tomcat'))) {
		console.log(
			'Please create a symbolic link /opt/tomcat pointing to your',
			"Portal's Tomcat directory so that QA projects can be deployed."
		);

		process.exit(1);
	}

	if (!fs.existsSync(path.join('/opt', 'deploy'))) {
		console.log(
			'Please create a symbolic link /opt/deploy pointing to your',
			"Portal's deploy directory so that QA projects can be deployed."
		);

		process.exit(1);
	}

	if (argv.liferayVersion) {
		console.log('Using version:', argv.liferayVersion);
	}

	fs.emptyDirSync(pkgsDir);
	fs.emptyDirSync(path.join(workDir, 'node_modules'));

	spawn('yarn', ['install'], {cwd: workDir});
}

function generateSamples() {
	generateSample(pkgsDir, generatorPath, {});

	generateSample(pkgsDir, classicGeneratorPath, {
		theme: {
			themeName: 'Classic Based Theme',
		},
	});

	generateSample(pkgsDir, adminGeneratorPath, {
		theme: {
			themeName: 'Admin Based Theme',
		},
	});

	generateSample(pkgsDir, themeletGeneratorPath, {});

	generateSample(pkgsDir, layoutGeneratorPath, {});

	generateSample(pkgsDir, generatorPath, {
		theme: {
			themeName: 'Theme With Layout',
		},
	});
	generateSample(
		path.join(pkgsDir, 'theme-with-layout-theme'),
		layoutGeneratorPath,
		{
			layout: {
				layoutName: 'Layout Inside Theme',
			},
		}
	);
}

function runYarnInstall() {
	const prjDirs = fs.readdirSync(pkgsDir);

	// Delete local package dependencies so that they are resolved locally from
	// the project's workspace

	prjDirs.forEach((prjDir) => {
		const pkgJsonPath = path.join(pkgsDir, prjDir, 'package.json');

		let pkgJson = require(pkgJsonPath);

		pkgJson = deleteDevDependency(pkgJson, 'liferay-font-awesome');
		pkgJson = deleteDevDependency(pkgJson, 'liferay-theme-tasks');

		fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '\t'));
	});

	spawn('yarn', ['install'], {cwd: workDir});
}

function deployProjects() {
	spawn('yarn', ['run', 'deploy'], {cwd: workDir});
}

// HELPERS /////////////////////////////////////////////////////////////////////

function deleteDevDependency(pkgJson, pkgName) {
	if (!pkgJson.devDependencies) {
		return pkgJson;
	}

	if (!pkgJson.devDependencies[pkgName]) {
		return pkgJson;
	}

	pkgJson.deleted = pkgJson.deleted || {};
	pkgJson.deleted.devDependencies = pkgJson.deleted.devDependencies || {};
	pkgJson.deleted.devDependencies[pkgName] = pkgJson.devDependencies[pkgName];

	delete pkgJson.devDependencies['liferay-theme-tasks'];

	return pkgJson;
}

function generateSample(cwd, generatorPath, answers) {
	const configJsonPath = path.join(
		os.tmpdir(),
		'generator-liferay-theme.json'
	);

	const configJson = {
		answers: {
			init: {
				appServerPath: '/opt/tomcat',
				deploymentStrategy: 'LocalAppServer',
			},
			...answers,
		},
		batchMode: true,
	};

	fs.writeJsonSync(configJsonPath, configJson, {spaces: '\t'});

	const args = [generatorPath, '--config', configJsonPath, '--skip-install'];

	if (argv.liferayVersion) {
		args.push('--liferayVersion', argv.liferayVersion);
	}

	spawn(yoPath, args, {cwd});
}

function spawn(cmd, args, options = {}) {
	const proc = childProcess.spawnSync(cmd, args, {
		shell: true,
		stdio: 'inherit',
		...options,
	});

	if (proc.error || proc.status !== 0) {
		process.exit(1);
	}
}
