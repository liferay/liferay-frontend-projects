/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const os = require('os');
const path = require('path');

const jsToolkitPath = path.join(__dirname, '..', '..');

const liferayCliPath = path.join(
	jsToolkitPath,
	'packages',
	'liferay-cli',
	'bin',
	'liferay.js'
);
const qaDir = path.join(jsToolkitPath, 'qa');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'js-toolkit-qa'));

module.exports = {
	liferayCliPath,
	liferayDir: findLiferayDir(),
	qaDir,
	tmpDir,
};

function findLiferayDir() {

	// Find Liferay installation directory

	let liferayDir = path.join(__dirname, '..', '..', 'liferay');

	try {
		const json = JSON.parse(
			fs.readFileSync(path.join(os.homedir(), '.liferay.json'))
		);

		liferayDir = json.deploy.path;
	}
	catch (error) {

		// swallow

	}

	return liferayDir;
}
