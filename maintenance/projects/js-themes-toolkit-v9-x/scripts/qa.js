/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable no-console, @liferay/no-dynamic-require */

const childProcess = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const {argv} = require('yargs');

const workDir = path.resolve(__dirname, '..', 'qa');

const pkgsDir = path.join(workDir, 'packages');
const yoPath = path.join(workDir, 'node_modules', '.bin', 'yo');

checkPrerrequisites();
generateSamples();
runYarnInstall();
configureProjects();
deployProjects();

// TASKS ///////////////////////////////////////////////////////////////////////

function checkPrerrequisites() {
	if (!fs.existsSync(path.join('/', 'opt', 'tomcat'))) {
		console.log(
			'Please create a symbolic link /opt/tomcat pointing to your',
			"Portal's Tomcat directory so that QA projects can be deployed."
		);

		process.exit(1);
	}

	if (!fs.existsSync(path.join('/', 'opt', 'deploy'))) {
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
	spawn(yoPath, ['liferay-theme', '--qa'], {
		cwd: pkgsDir,
		liferayVersion: true,
	});

	spawn(
		yoPath,
		[
			'liferay-theme:classic',
			'--qa',
			'--themeName',
			'"Classic Based Theme"',
		],
		{cwd: pkgsDir, liferayVersion: true}
	);

	spawn(
		yoPath,
		['liferay-theme:admin', '--qa', '--themeName', '"Admin Based Theme"'],
		{cwd: pkgsDir, liferayVersion: true}
	);

	spawn(yoPath, ['liferay-theme:themelet', '--qa'], {
		cwd: pkgsDir,
		liferayVersion: true,
	});

	spawn(yoPath, ['liferay-theme:layout', '--qa'], {
		cwd: pkgsDir,
		liferayVersion: true,
	});

	spawn(
		yoPath,
		['liferay-theme', '--qa', '--themeName', '"Theme With Layout"'],
		{cwd: pkgsDir, liferayVersion: true}
	);
	spawn(
		yoPath,
		[
			'liferay-theme:layout',
			'--qa',
			'--layoutName',
			'"Layout Inside Theme"',
		],
		{
			cwd: path.join(pkgsDir, 'theme-with-layout-theme'),
			liferayVersion: true,
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

		pkgJson = deleteDevDependency(pkgJson, 'liferay-theme-tasks');

		fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '\t'));
	});

	spawn('yarn', ['install'], {cwd: workDir});
}

function configureProjects() {
	const prjDirs = fs.readdirSync(pkgsDir);

	prjDirs.forEach((prjDir) => {
		const pkgJsonPath = path.join(pkgsDir, prjDir, 'package.json');

		const pkgJson = require(pkgJsonPath);

		let fileName;
		let jsonProperty;

		if (pkgJson.liferayTheme && !pkgJson.liferayTheme.themelet) {
			fileName = 'liferay-theme.json';
			jsonProperty = 'LiferayTheme';
		}
		else if (pkgJson.liferayLayoutTemplate) {
			fileName = 'liferay-plugin.json';
			jsonProperty = 'LiferayPlugin';
		}

		if (!fileName) {
			return;
		}

		const json = {};

		json[jsonProperty] = {
			appServerPath: '/opt/tomcat',
			appServerPathPlugin: `/opt/tomcat/webapps/${prjDir}`,
			deployPath: '/opt/deploy',
			deployed: false,
			deploymentStrategy: 'LocalAppServer',
			pluginName: prjDir,
			url: 'http://localhost:8080',
		};

		fs.writeFileSync(
			path.join(pkgsDir, prjDir, fileName),
			JSON.stringify(json, null, '\t')
		);
	});
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

function spawn(cmd, args, options = {}) {
	if (options.liferayVersion && argv.liferayVersion) {
		args.push('--liferayVersion', argv.liferayVersion);
	}

	const proc = childProcess.spawnSync(cmd, args, {
		shell: true,
		stdio: 'inherit',
		...options,
	});

	if (proc.error || proc.status !== 0) {
		process.exit(1);
	}
}
