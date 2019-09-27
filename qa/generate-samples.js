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
const rimraf = require('rimraf');
const yargs = require('yargs');

const argv = yargs
	.option('projects', {
		alias: 'p',
		default: 'essential',
	})
	.option('sdk', {
		alias: 's',
		default: '../../../../../..',
	}).argv;

// Configure directories
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
const yoFile = path.join(__dirname, '..', 'node_modules', '.bin', 'yo');

// Find Liferay installation directory
let liferayDir = path.join(__dirname, '..', 'liferay');

try {
	const json = JSON.parse(
		fs.readFileSync(path.join(os.homedir(), '.generator-liferay-js.json'))
	);
	liferayDir = json.answers['*'].liferayDir;
} catch (err) {
	// swallow
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
				// sdkVersion: argv.sdk,
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

// Prepare a clean out directory
console.log('Cleaning work directories');
rimraf.sync(cfgDir);
fs.ensureDirSync(cfgDir);
fs.ensureDirSync(outDir);
fs.ensureDirSync(pkgsDir);

const start = new Date();

// Generate shared bundle configuration
[true, false].forEach(createInitializer => {
	writeConfig({
		target: `shared-bundle`,
		folder: `shared-bundle` + `${createInitializer ? '-initializer' : ''}`,
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

// Decide which projects should be generated
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

// Generate samples
configs.forEach(config => {
	console.log(`
********************************************************************************
* Generate ${config}
********************************************************************************
	`);

	fs.emptyDirSync(path.join(pkgsDir, config.replace('.json', '')));

	const proc = childProcess.spawnSync(
		'node',
		[yoFile, generatorFile, '--config', path.join(cfgDir, config)],
		{stdio: 'inherit', cwd: pkgsDir, shell: true}
	);

	if (proc.error || proc.status != 0) {
		process.exit(1);
	}
});

console.log(
	'Full generation of samples took',
	((new Date().getTime() - start.getTime()) / 1000).toFixed(0),
	'seconds'
);
