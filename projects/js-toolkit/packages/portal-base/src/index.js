/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {format} = require('@liferay/js-toolkit-core');
const path = require('path');

const build = require('./build');
const clean = require('./clean');
const deploy = require('./deploy');

const {fail, print, title} = format;

module.exports = function run(platformPath, overrides) {
	if (process.argv.length < 3) {
		print(fail`No command provided`);
		process.exit(1);
	}

	const cmd = process.argv[2];

	/* eslint-disable-next-line */
	const pkgJson = require(path.join(platformPath, 'package.json'));
	const tasks = {build, clean, deploy, ...(overrides || {})};

	switch (cmd) {
		case 'build':
			print(
				title`Building project for target platform: {${pkgJson.name}}`
			);
			tasks.build();
			break;

		case 'clean':
			print(title`Cleaning output folders`);
			tasks.clean();
			break;

		case 'deploy':
			print(title`Deploying project to Liferay local installation`);
			tasks.deploy();
			break;

		default:
			print(fail`Unknown command: {${cmd}}`);
			process.exit(1);
			break;
	}
};
