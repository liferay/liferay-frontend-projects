#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const outDir = path.resolve('samples');
const pkgsDir = path.join(outDir, 'packages');

/**
 * @param {object} options
 */
function writeConfig(options) {
	const name = options.folder;

	console.log('Generating test config for', name);

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
							`-${useSettings ? 'cfg' : 'nocfg'}` +
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
							`-${useSettings ? 'cfg' : 'nocfg'}` +
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

// Generate samples
const configs = fs.readdirSync('config');

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
