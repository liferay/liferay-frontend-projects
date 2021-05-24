#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {
	error,
	print,
	title,
} = require('liferay-npm-build-tools-common/lib/format');

const build = require('./build');
const pkgJson = require('./package.json');

if (process.argv.length < 3) {
	print(error`No command provided`);
	process.exit(1);
}

const cmd = process.argv[2];

switch (cmd) {
	case 'build':
		print(title`Building project for target platform: {${pkgJson.name}}`);
		build();
		break;

	default:
		print(error`Unknown command: {${cmd}}`);
		process.exit(1);
		break;
}
