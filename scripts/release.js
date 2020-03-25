/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const abort = require('./lib/abort');
const run = require('./lib/run');

const packagesDir = path.join(__dirname, '..', 'packages');
const topologicallyOrderedProjectNames = [
	'liferay-theme-mixins',
	'liferay-theme-tasks',
	'generator-liferay-theme',
];

if (process.argv.length < 3) {
	abort('Version must be specified as the first argument of yarn release');
}

const version = process.argv[2];

topologicallyOrderedProjectNames.forEach(projectName => {
	run('yarn', 'version', '--new-version', version, {
		cwd: path.join(packagesDir, projectName),
	});
});
