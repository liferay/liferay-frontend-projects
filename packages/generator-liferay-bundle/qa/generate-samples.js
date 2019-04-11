#!/usr/bin/env node

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const yargs = require('yargs');

const argv = yargs.option('projects', {
	alias: 'p',
	default: 'all',
}).argv;

const outDir = path.resolve('samples');
const pkgsDir = path.join(outDir, 'packages');

/**
 * @param {object} options
 */
function writeConfig(options) {
	const name = options.folder;

	fs.writeFileSync(
		path.join('config', `${name}.json`),
		JSON.stringify(
			{
				batchMode: true,
				sdkVersion: '../../../../../..',
				answers: {
					'*': Object.assign(
						{
							description: options.folder,
							category: 'category.sample',
							liferayPresent: true,
							liferayDir: '../../../liferay-portal-master',
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
rimraf.sync(outDir);
fs.mkdirSync(outDir);
fs.mkdirSync(pkgsDir);

const start = new Date();

// Generate vanilla samples configuration
[true, false].forEach(useBabel => {
	[true, false].forEach(useLocalization => {
		[true, false].forEach(useSettings => {
			[true, false].forEach(usePreferences => {
				[true, false].forEach(sampleWanted => {
					writeConfig({
						target: `vanilla-portlet`,
						folder:
							`vanilla-portlet` +
							`-${useBabel ? 'es6' : 'es5'}` +
							`-${useLocalization ? 'l10n' : 'nol10n'}` +
							`-${useSettings ? 'sets' : 'nosets'}` +
							`-${usePreferences ? 'prefs' : 'noprefs'}` +
							`-${sampleWanted ? 'sample' : 'nosample'}`,
						useLocalization,
						useSettings,
						usePreferences,
						sampleWanted,
					});
				});
			});
		});
	});
});

// Generate framework samples configuration
['angular', 'metaljs', 'react', 'vuejs'].forEach(fw => {
	[true, false].forEach(useLocalization => {
		[true, false].forEach(useSettings => {
			[true, false].forEach(usePreferences => {
				[true, false].forEach(sampleWanted => {
					writeConfig({
						target: `${fw}-portlet`,
						folder:
							`${fw}-portlet` +
							`-${useLocalization ? 'l10n' : 'nol10n'}` +
							`-${useSettings ? 'sets' : 'nosets'}` +
							`-${usePreferences ? 'prefs' : 'noprefs'}` +
							`-${sampleWanted ? 'sample' : 'nosample'}`,
						useLocalization,
						useSettings,
						usePreferences,
						sampleWanted,
					});
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
			'angular-portlet-l10n-sets-prefs-sample.json',
			'export-bundle.json',
			'metaljs-portlet-l10n-sets-prefs-sample.json',
			'react-portlet-l10n-sets-prefs-sample.json',
			'vanilla-portlet-es5-l10n-sets-prefs-sample.json',
			'vanilla-portlet-es6-l10n-sets-prefs-sample.json',
			'vuejs-portlet-l10n-sets-prefs-sample.json',
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

	const proc = childProcess.spawnSync(
		'yo',
		['liferay-bundle', '--config', path.resolve('config', config)],
		{stdio: 'inherit', cwd: pkgsDir, shell: true}
	);

	if (proc.error || proc.status != 0) {
		process.exit(1);
	}
});

// Setup lerna
console.log(`
********************************************************************************
* Setup lerna
********************************************************************************
`);

fs.writeFileSync(path.join(outDir, 'lerna.json'), '{}');

childProcess.spawnSync('lerna', ['init'], {
	stdio: 'inherit',
	cwd: outDir,
	shell: true,
});

console.log(
	'Full generation of samples took',
	((new Date().getTime() - start.getTime()) / 1000).toFixed(0),
	'seconds'
);
