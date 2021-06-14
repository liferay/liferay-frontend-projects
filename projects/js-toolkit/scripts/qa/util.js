/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

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
	catch (error) {

		// swallow

	}
}

function spawn(cmd, args, options = {}) {
	const proc = childProcess.spawnSync(cmd, args, {
		cwd: path.join('..', '..'),
		shell: true,
		stdio: 'inherit',
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
				answers: {
					'*': {
						category: 'JS Toolkit QA',
						description: options.folder,
						liferayDir,
						liferayPresent: true,
						pkgManager: 'yarn',
						...options,
					},
				},
				batchMode: true,
				sdkVersion: currentVersion,
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
