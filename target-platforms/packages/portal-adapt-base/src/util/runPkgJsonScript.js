/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');

/**
 *
 * @param {Project} project
 * @param {string} script
 * @param {Array<*>} args
 */
module.exports = function runPkgJsonScript(project, script, args = []) {
	const {pkgManager} = project;

	if (pkgManager !== 'yarn') {
		args = ['--'].concat(args);
	}

	const proc = childProcess.spawnSync(pkgManager, ['run', script, ...args], {
		shell: true,
		stdio: 'inherit',
	});

	if (proc.error) {
		throw proc.error;
	}
	else if (proc.status != 0) {
		throw new Error(
			`Package script '${script}' finished with status ${proc.status}`
		);
	}
	else if (proc.signal) {
		throw new Error(
			`Package script '${script}' finished due to signal ${proc.signal}`
		);
	}
};
