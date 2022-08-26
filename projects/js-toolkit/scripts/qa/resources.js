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

const testDir = path.join(os.tmpdir(), 'js-toolkit-qa');

fs.mkdirSync(testDir, {recursive: true});

const tmpDir = path.join(testDir, 'tmp');

if (fs.existsSync(tmpDir)) {
	fs.rmSync(tmpDir, {recursive: true});
}
fs.mkdirSync(tmpDir, {recursive: true});

module.exports = {
	jsToolkitPath,
	liferayCliPath,
	liferayDir: findLiferayDir(),
	qaDir,
	testDir,
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
