#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {format} = require('@liferay/js-toolkit-core');
const {build, clean, deploy} = require('@liferay/portal-adapt-base');

const pkgJson = require('./package.json');

const {fail, print, title} = format;

if (process.argv.length < 3) {
	print(fail`No command provided`);
	process.exit(1);
}

const cmd = process.argv[2];

switch (cmd) {
	case 'build':
		print(title`Building project for target platform: {${pkgJson.name}}`);
		build();
		break;

	case 'clean':
		print(title`Cleaning output folders`);
		clean();
		break;

	case 'deploy':
		print(title`Deploying project to Liferay local installation`);
		deploy();
		break;

	default:
		print(fail`Unknown command: {${cmd}}`);
		process.exit(1);
}
