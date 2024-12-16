/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const {currentVersion, liferayDir} = require('./resources');

function logStep(step) {
	console.log(`
********************************************************************************
* ${step}
********************************************************************************
`);
}

function safeUnlink(path) {
	try {
		fs.unlinkSync(path);
	}
	catch (err) {

		// swallow

	}
}

function spawn(cmd, args, options = {}) {
	const proc = childProcess.spawnSync(cmd, args, {
		stdio: 'inherit',
		cwd: path.join('..', '..'),
		shell: true,
		...options,
	});

	if (proc.error || proc.status !== 0) {
		process.exit(1);
	}
}

function writeConfig(dir, options) {
	const name = options.folder;

	fs.writeFileSync(
		path.join(dir, `${name}.json`),
		JSON.stringify(
			{
				batchMode: true,
				sdkVersion: currentVersion,
				answers: {
					'*': {
						description: options.folder,
						category: 'JS Toolkit QA',
						liferayPresent: true,
						liferayDir,
						pkgManager: 'yarn',
						...options,
					},
				},
			},
			null,
			2
		)
	);
}

module.exports = {
	logStep,
	safeUnlink,
	spawn,
	writeConfig,
};
