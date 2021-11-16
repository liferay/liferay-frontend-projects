#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const path = require('path');

const {
	liferayDir,
	liferayJsAdaptGeneratorPath,
	liferayJsGeneratorPath,
	packagesDir,
	qaDir,
	samplesDir,
	yoPath,
} = require('./resources');
const {logStep, spawn, writeConfig} = require('./util');

const configDir = path.join(qaDir, 'config');

function generateSamples() {
	ensureDirectories();
	writeConfigurations();
	const configs = getUsedConfigurations();

	generateLiferaySamples(configs);
	prepareManualProjects();
	generateCreateReactAppSample();
	generateAngularCliSample();
	generateVueCliSample();
}

module.exports = generateSamples;

function ensureDirectories() {
	logStep('Creating directories');

	fs.ensureDirSync(configDir);
	fs.ensureDirSync(samplesDir);
	fs.ensureDirSync(packagesDir);
}

function writeConfigurations() {
	logStep('Writing generator configuration files');

	// Generate create-react-app configuration

	writeConfig(configDir, {
		folder: `create-react-app`,
	});

	// Generate angular-cli configuration

	writeConfig(configDir, {
		folder: `angular-cli`,
	});

	// Generate vue-cli configuration

	writeConfig(configDir, {
		folder: `vue-cli`,
	});

	// Generate shared bundle configuration

	[true, false].forEach((createInitializer) => {
		writeConfig(configDir, {
			target: `shared-bundle`,
			folder:
				`shared-bundle` + `${createInitializer ? '-initializer' : ''}`,
			createInitializer,
		});
	});

	// Generate vanilla samples configuration

	[true, false].forEach((useBabel) => {
		[true, false].forEach((useLocalization) => {
			[true, false].forEach((useConfiguration) => {
				[true, false].forEach((sampleWanted) => {
					writeConfig(configDir, {
						target: `vanilla-portlet`,
						folder:
							`vanilla-portlet` +
							`-${useBabel ? 'es6' : 'es5'}` +
							`-${useLocalization ? 'l10n' : 'nol10n'}` +
							`-${useConfiguration ? 'cfg' : 'nocfg'}` +
							`-${sampleWanted ? 'sample' : 'nosample'}`,
						useLocalization,
						useConfiguration,
						sampleWanted,
					});
				});
			});
		});
	});

	// Generate framework samples configuration

	['angular', 'metaljs', 'react', 'vuejs'].forEach((fw) => {
		[true, false].forEach((useLocalization) => {
			[true, false].forEach((useConfiguration) => {
				[true, false].forEach((sampleWanted) => {
					writeConfig(configDir, {
						target: `${fw}-portlet`,
						folder:
							`${fw}-portlet` +
							`-${useLocalization ? 'l10n' : 'nol10n'}` +
							`-${useConfiguration ? 'cfg' : 'nocfg'}` +
							`-${sampleWanted ? 'sample' : 'nosample'}`,
						useLocalization,
						useConfiguration,
						sampleWanted,
					});
				});
			});
		});
	});
}

function getUsedConfigurations() {
	return [
		'angular-portlet-l10n-cfg-sample.json',
		'shared-bundle.json',
		'metaljs-portlet-l10n-cfg-sample.json',
		'react-portlet-l10n-cfg-sample.json',
		'vanilla-portlet-es5-l10n-cfg-sample.json',
		'vanilla-portlet-es6-l10n-cfg-sample.json',
		'vuejs-portlet-l10n-cfg-sample.json',
	];
}

function generateLiferaySamples(configs) {
	configs.forEach((config) => {
		logStep(`Generating Liferay sample project ${config}`);

		fs.emptyDirSync(path.join(packagesDir, config.replace('.json', '')));

		spawn(
			yoPath,
			[
				liferayJsGeneratorPath,
				'--skip-install',
				'--config',
				path.join(configDir, config),
			],
			{cwd: packagesDir}
		);
	});
}

function prepareManualProjects() {
	['loaders'].forEach((prj) => {

		// Change deploy directory

		const npmbuildrcPath = path.join(packagesDir, prj, '.npmbuildrc');

		const npmbuildrc = JSON.parse(fs.readFileSync(npmbuildrcPath));

		npmbuildrc.liferayDir = liferayDir;

		fs.writeFileSync(npmbuildrcPath, JSON.stringify(npmbuildrc, null, '	'));
	});
}

function generateCreateReactAppSample() {
	logStep(`Generating create-react-app sample project`);

	// Because create-react-app cannot be run with --skip-install and it would
	// interfere with out yarn QA workspace, we create the application in a
	// temporary directory, delete the node_modules after creation, and move it
	// to our QA folder.

	const tmpDir = path.join(qaDir, 'tmp');

	const tmpPrjDir = path.join(tmpDir, 'create-react-app');

	fs.emptyDirSync(tmpPrjDir);

	spawn('npx', ['create-react-app', 'create-react-app'], {cwd: tmpDir});

	fs.removeSync(path.join(tmpPrjDir, 'yarn.lock'));
	fs.removeSync(path.join(tmpPrjDir, 'node_modules'));

	const prjDir = path.join(packagesDir, 'create-react-app');

	fs.removeSync(prjDir);

	fs.moveSync(tmpPrjDir, prjDir);

	fs.removeSync(tmpDir);

	spawn(
		yoPath,
		[
			liferayJsAdaptGeneratorPath,
			'--skip-install',
			'--force',
			'--config',
			path.join(configDir, 'create-react-app.json'),
		],
		{
			cwd: path.join(packagesDir, 'create-react-app'),
		}
	);
}

function generateAngularCliSample() {
	logStep(`Generating angular-cli sample project`);

	fs.emptyDirSync(path.join(packagesDir, 'angular-cli'));

	spawn(
		'npx',
		['@angular/cli', 'new', 'angular-cli', '--defaults', '--skip-install'],
		{
			cwd: packagesDir,
		}
	);

	spawn(
		yoPath,
		[
			liferayJsAdaptGeneratorPath,
			'--skip-install',
			'--force',
			'--config',
			path.join(configDir, 'angular-cli.json'),
		],
		{
			cwd: path.join(packagesDir, 'angular-cli'),
		}
	);
}

function generateVueCliSample() {
	logStep(`Generating vue-cli sample project`);

	fs.removeSync(path.join(packagesDir, 'vue-cli'));

	spawn('npx', ['@vue/cli', 'create', 'vue-cli', '-d', '-m', 'yarn'], {
		cwd: packagesDir,
	});

	spawn(
		yoPath,
		[
			liferayJsAdaptGeneratorPath,
			'--skip-install',
			'--force',
			'--config',
			path.join(configDir, 'vue-cli.json'),
		],
		{
			cwd: path.join(packagesDir, 'vue-cli'),
		}
	);
}
