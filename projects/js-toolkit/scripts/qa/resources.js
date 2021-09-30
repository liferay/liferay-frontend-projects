/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const os = require('os');
const path = require('path');

const qaDir = path.join(__dirname, '..', '..', 'qa');
const samplesDir = path.join(qaDir, 'samples');
const packagesDir = path.join(samplesDir, 'packages');

const {version: currentSDKVersion} = require(path.join(
	'..',
	'..',
	'packages',
	'@liferay',
	'npm-bundler',
	'package.json'
));

const lernaPath = path.join(
	__dirname,
	'..',
	'..',
	'node_modules',
	'lerna',
	'cli.js'
);

const liferayDir = findLiferayDir();

const liferayJsAdaptGeneratorPath = path.join(
	__dirname,
	'..',
	'..',
	'packages',
	'generator-js',
	'generators',
	'adapt',
	'index.js'
);

const liferayJsGeneratorPath = path.join(
	__dirname,
	'..',
	'..',
	'packages',
	'generator-js',
	'generators',
	'app',
	'index.js'
);

const linkJsToolkitProjectDir = path.join(
	__dirname,
	'..',
	'..',
	'resources',
	'devtools',
	'link-js-toolkit'
);

const linkJsToolkitPath = path.join(
	linkJsToolkitProjectDir,
	'link-js-toolkit.js'
);

const yoPath =
	process.platform === 'win32'
		? path.join(__dirname, '..', '..', 'node_modules', '.bin', 'yo.cmd')
		: path.join(__dirname, '..', '..', 'node_modules', '.bin', 'yo');

module.exports = {
	currentSDKVersion,
	lernaPath,
	liferayDir,
	liferayJsAdaptGeneratorPath,
	liferayJsGeneratorPath,
	linkJsToolkitPath,
	linkJsToolkitProjectDir,
	packagesDir,
	qaDir,
	samplesDir,
	yoPath,
};

function findLiferayDir() {

	// Find Liferay installation directory

	let liferayDir = path.join(__dirname, '..', '..', 'liferay');

	try {
		const json = JSON.parse(
			fs.readFileSync(
				path.join(os.homedir(), '.generator-liferay-js.json')
			)
		);
		liferayDir = json.answers['*'].liferayDir;
	}
	catch (error) {

		// swallow

	}

	return liferayDir;
}
