const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const outDir = path.resolve('samples');
const pkgsDir = path.join(outDir, 'packages');

// Prepare a clean out directory
rimraf.sync(outDir);
fs.mkdirSync(outDir);
fs.mkdirSync(pkgsDir);

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
