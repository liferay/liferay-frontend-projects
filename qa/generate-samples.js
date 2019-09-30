#!/usr/bin/env node

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const yargs = require('yargs');

// Configure directories and files
const cfgDir = path.join(__dirname, 'config');
const outDir = path.join(__dirname, 'samples');
const pkgsDir = path.join(outDir, 'packages');
const generatorFile = path.join(
	__dirname,
	'..',
	'packages',
	'generator-liferay-js',
	'generators',
	'app',
	'index.js'
);
const generatorAdaptFile = path.join(
	__dirname,
	'..',
	'packages',
	'generator-liferay-js',
	'generators',
	'adapt',
	'index.js'
);
const yoFile = path.join(__dirname, '..', 'node_modules', '.bin', 'yo');
const liferayDir = findLiferayDir();
const currentVersion = require(path.join(
	'..',
	'packages',
	'liferay-npm-bundler',
	'package.json'
)).version;

// Retrieve arguments
const argv = yargs
	.option('projects', {
		alias: 'p',
		default: 'essential',
	})
	.option('sdk', {
		alias: 's',
		default: '../../../../../..',
	}).argv;

// Do the job
const start = new Date();

ensureDirectories();
writeConfigurations();
const configs = getUsedConfigurations();
generateSamples(configs);
tweakManualSamples();
generateCreateReactAppSample();

console.log(
	'Full generation of samples took',
	((new Date().getTime() - start.getTime()) / 1000).toFixed(0),
	'seconds'
);

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 *
 */
function findLiferayDir() {
	// Find Liferay installation directory
	let liferayDir = path.join(__dirname, '..', 'liferay');

	try {
		const json = JSON.parse(
			fs.readFileSync(
				path.join(os.homedir(), '.generator-liferay-js.json')
			)
		);
		liferayDir = json.answers['*'].liferayDir;
	} catch (err) {
		// swallow
	}

	return liferayDir;
}

/**
 *
 */
function ensureDirectories() {
	fs.ensureDirSync(cfgDir);
	fs.ensureDirSync(outDir);
	fs.ensureDirSync(pkgsDir);
}

/**
 *
 */
function writeConfigurations() {
	// Generate shared bundle configuration
	[true, false].forEach(createInitializer => {
		writeConfig({
			target: `shared-bundle`,
			folder:
				`shared-bundle` + `${createInitializer ? '-initializer' : ''}`,
			createInitializer,
		});
	});

	// Generate vanilla samples configuration
	[true, false].forEach(useBabel => {
		[true, false].forEach(useLocalization => {
			[true, false].forEach(useConfiguration => {
				[true, false].forEach(sampleWanted => {
					writeConfig({
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
	['angular', 'metaljs', 'react', 'vuejs'].forEach(fw => {
		[true, false].forEach(useLocalization => {
			[true, false].forEach(useConfiguration => {
				[true, false].forEach(sampleWanted => {
					writeConfig({
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

	// Generate create-react-app configuration
	writeConfig({
		folder: `create-react-app`,
	});
}

/**
 * @param {object} options
 */
function writeConfig(options) {
	const name = options.folder;

	fs.writeFileSync(
		path.join(cfgDir, `${name}.json`),
		JSON.stringify(
			{
				batchMode: true,
				sdkVersion: currentVersion,
				answers: {
					'*': Object.assign(
						{
							description: options.folder,
							category: 'category.sample',
							liferayPresent: true,
							liferayDir,
						},
						options
					),
				},
			},
			null,
			2
		)
	);
}

/**
 *
 */
function getUsedConfigurations() {
	let configs;

	switch (argv.projects) {
		case 'all':
			configs = fs.readdirSync('config');
			break;

		case 'essential':
			configs = [
				'angular-portlet-l10n-cfg-sample.json',
				'shared-bundle.json',
				'metaljs-portlet-l10n-cfg-sample.json',
				'react-portlet-l10n-cfg-sample.json',
				'vanilla-portlet-es5-l10n-cfg-sample.json',
				'vanilla-portlet-es6-l10n-cfg-sample.json',
				'vuejs-portlet-l10n-cfg-sample.json',
			];
			break;

		case 'none':
			configs = [];
			break;

		default:
			console.error(`Invalid --projects value: ${argv.projects}`);
			process.exit(1);
			break;
	}

	return configs;
}

/**
 *
 * @param {string[]} configs
 */
function generateSamples(configs) {
	// Generate samples
	configs.forEach(config => {
		console.log(`
********************************************************************************
* Generate ${config}
********************************************************************************
	`);

		fs.emptyDirSync(path.join(pkgsDir, config.replace('.json', '')));

		spawn('node', [
			yoFile,
			generatorFile,
			'--config',
			path.join(cfgDir, config),
		]);
	});
}

/**
 *
 */
function generateCreateReactAppSample() {
	console.log(`
********************************************************************************
* Generate create-react-app.json
********************************************************************************
`);

	fs.emptyDirSync(path.join(pkgsDir, 'create-react-app'));

	spawn('npx', ['create-react-app', 'create-react-app']);

	spawn(
		'node',
		[
			yoFile,
			generatorAdaptFile,
			'liferay-js:adapt',
			'--force',
			'--config',
			path.join(cfgDir, 'create-react-app.json'),
		],
		{
			cwd: path.join(pkgsDir, 'create-react-app'),
		}
	);
}

function tweakManualSamples() {
	['loaders'].forEach(prj => {
		// Change package.json versions
		const pkgJsonPath = path.join(pkgsDir, prj, 'package.json');
		const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));

		Object.entries(pkgJson.devDependencies).forEach(([dep, version]) => {
			if (version === '$CURRENT$') {
				pkgJson.devDependencies[dep] = currentVersion;
			}
		});

		fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, '	'));

		// Change deploy directory
		const npmbuildrcPath = path.join(pkgsDir, prj, '.npmbuildrc');
		const npmbuildrc = JSON.parse(fs.readFileSync(npmbuildrcPath));

		npmbuildrc.liferayDir = liferayDir;

		fs.writeFileSync(npmbuildrcPath, JSON.stringify(npmbuildrc, null, '	'));
	});
}

/**
 *
 * @param {string} cmd
 * @param {array} args
 * @param {object} options
 */
function spawn(cmd, args, options = {}) {
	const proc = childProcess.spawnSync(
		cmd,
		args,
		Object.assign({stdio: 'inherit', cwd: pkgsDir, shell: true}, options)
	);

	if (proc.error || proc.status != 0) {
		process.exit(1);
	}
}
