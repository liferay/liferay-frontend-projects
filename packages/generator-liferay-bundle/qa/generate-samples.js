#!/usr/bin/env node

const childProcess = require('child_process');
const {get, has} = require('dot-prop');
const fs = require('fs');
const os = require('os');
const path = require('path');
const readJsonSync = require('read-json-sync');
const rimraf = require('rimraf');

const outDir = path.resolve('samples');
const pkgsDir = path.join(outDir, 'packages');

const homeConfig = readJsonSync(
	path.join(os.homedir(), '.generator-liferay-bundle.json')
);

if (
	!has(homeConfig, 'answers.facet-deploy.liferayDir') &&
	!has(homeConfig, 'answers.*.liferayDir')
) {
	console.error(
		`Property 'answers.facet-deploy.liferayDir' must be set in`,
		path.join(os.homedir(), '.generator-liferay-bundle.json'),
		'for the generated projects to be deployed. Exiting.'
	);
	process.exit(1);
}

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
				answers: {
					'*': Object.assign(
						{
							description: options.folder,
							category: 'category.sample',
							liferayPresent: true,
							liferayDir: get(
								homeConfig,
								'answers.facet-deploy.liferayDir',
								get(homeConfig, 'answers.*.liferayDir')
							),
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
			[true, false].forEach(sampleWanted => {
				writeConfig({
					target: `vanilla-portlet`,
					folder:
						`vanilla-portlet` +
						`-${useBabel ? 'es6' : 'es5'}` +
						`-${useLocalization ? 'l10n' : 'nol10n'}` +
						`-${useSettings ? 'cfg' : 'nocfg'}` +
						`-${sampleWanted ? 'sample' : 'nosample'}`,
					useLocalization,
					useSettings,
					sampleWanted,
				});
			});
		});
	});
});

// Generate framework samples configuration
['angular', 'metaljs', 'react', 'vuejs'].forEach(fw => {
	[true, false].forEach(useLocalization => {
		[true, false].forEach(useSettings => {
			[true, false].forEach(sampleWanted => {
				writeConfig({
					target: `${fw}-portlet`,
					folder:
						`${fw}-portlet` +
						`-${useLocalization ? 'l10n' : 'nol10n'}` +
						`-${useSettings ? 'cfg' : 'nocfg'}` +
						`-${sampleWanted ? 'sample' : 'nosample'}`,
					useLocalization,
					useSettings,
					sampleWanted,
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
		{stdio: 'inherit', cwd: pkgsDir}
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

childProcess.spawnSync('lerna', ['init'], {stdio: 'inherit', cwd: outDir});

console.log(
	'Full generation of samples took',
	((new Date().getTime() - start.getTime()) / 1000).toFixed(0),
	'seconds'
);
