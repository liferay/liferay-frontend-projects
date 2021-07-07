#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const getBaseConfigJson = require('../lib/getBaseConfigJson');
const getBasePackageJson = require('../lib/getBasePackageJson');
const writePlatform = require('../lib/writePlatform');

const IGNORED_PROJECTS = ['create-platform', 'portal-base'];

// Update platforms

console.log('\n===> Updating platforms');

const platformsDir = path.resolve(__dirname, '..', '..');

fs.readdirSync(platformsDir)
	.filter((name) => !IGNORED_PROJECTS.includes(name))
	.forEach((platformName) => {
		console.log('     ', platformName);

		const platformDir = path.join(platformsDir, platformName);

		const basePackageJson = getBasePackageJson(platformName);
		const srcPackageJson = JSON.parse(
			fs.readFileSync(path.join(platformDir, 'package.json'), 'utf8')
		);

		const packageJson = {
			...srcPackageJson,
			...basePackageJson,
			...{
				dependencies: {
					...srcPackageJson.dependencies,
					...basePackageJson.dependencies,
				},
			},
		};

		const configJson = {
			...JSON.parse(
				fs.readFileSync(path.join(platformDir, 'config.json'), 'utf8')
			),
			...getBaseConfigJson(platformName),
		};

		writePlatform(platformName, packageJson, configJson);
	});

// Format code

console.log('\n===> Formatting sources');

childProcess.spawnSync('yarn', ['format'], {
	cwd: path.join(platformsDir, '..'),
	stdio: 'inherit',
});
