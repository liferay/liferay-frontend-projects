#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @liferay/liferay/no-dynamic-require */
/* eslint-disable no-console */

const childProcess = require('child_process');
const path = require('path');

if (process.argv.length < 3) {
	console.log('ERROR: no command provided');
	process.exit(1);
}

const cmd = process.argv[2];

const bundlerPkgJsonPath = require.resolve('liferay-npm-bundler/package.json');
const bundlerDir = path.dirname(bundlerPkgJsonPath);
const bundlerPkgJson = require(bundlerPkgJsonPath);
const bundlerPath = path.resolve(
	bundlerDir,
	bundlerPkgJson.bin['liferay-npm-bundler']
);

switch (cmd) {
	case 'build':
		childProcess.fork(bundlerPath);
		break;

	default:
		console.log('ERROR: unknown command', cmd, 'provided');
		process.exit(1);
		break;
}
