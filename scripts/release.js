/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const abort = require('./lib/abort');
const confirm = require('./lib/confirm');
const run = require('./lib/run');

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const topologicallyOrderedProjectNames = [
	'liferay-theme-mixins',
	'liferay-theme-tasks',
	'generator-liferay-theme',
];

if (process.argv.length < 3) {
	abort('Version must be specified as the first argument of yarn release');
}

const version = process.argv[2];

run('yarn', 'updatePackageVersions', version);

run('yarn', 'changelog', `--version=v${version}`);

confirm(`
The changelog has been generated, please review it with your favourite editor.

You may change anything you don't like and when you are finished confirm the
following question to continue.

Is the changelog correct? Shall we continue`);

run('git', 'add', rootDir);

topologicallyOrderedProjectNames.forEach(projectName => {
	run('yarn', 'version', '--new-version', version, {
		cwd: path.join(packagesDir, projectName),
	});
});
