/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const {spawnSync} = require('child_process');
const {createHash} = require('crypto');
const fs = require('fs');
const path = require('path');

const ACTUAL_BUILD_DIR = path.resolve(__dirname, '../qa/test-project/build');
const EXPECTED_BUILD_DIR = path.resolve(
	__dirname,
	'../qa/test-project/build.expected'
);
const TEST_PROJECT_DIR = path.resolve(__dirname, '../qa/test-project');
const WORKSPACE_DIR = path.resolve(__dirname, '..', '..');

function diff(expectedDir, actualDir) {
	let somethingChanged = false;

	const expectedItems = fs.readdirSync(expectedDir);
	const actualItems = fs.readdirSync(actualDir);

	for (const actualItem of actualItems) {
		if (!expectedItems.includes(actualItem)) {
			somethingChanged = true;
			console.log('+', path.join(actualDir, actualItem));
		}
	}

	for (const expectedItem of expectedItems) {
		const actualFile = path.resolve(actualDir, expectedItem);
		const expectedFile = path.resolve(expectedDir, expectedItem);

		if (fs.statSync(expectedFile).isDirectory()) {
			somethingChanged =
				somethingChanged || diff(expectedFile, actualFile);
		}
		else if (!actualItems.includes(expectedItem)) {
			somethingChanged = true;
			console.log('-', path.join(actualDir, expectedItem));
		}
		else {
			const expectedContent = readExpected(expectedFile);
			const actualContent = fs.readFileSync(actualFile);

			const expectedHash = createHash('sha256')
				.update(expectedContent)
				.digest('hex');
			const actualHash = createHash('sha256')
				.update(actualContent)
				.digest('hex');

			if (expectedHash !== actualHash) {
				somethingChanged = true;
				console.log('*', path.join(actualDir, expectedItem));
			}
		}
	}

	return somethingChanged;
}

function readExpected(file) {
	let content = fs.readFileSync(file).toString();

	if (file.toLowerCase().endsWith('.css.map')) {
		content = content.replace(/{{WORKSPACE_DIR}}/g, WORKSPACE_DIR);
	}

	return content;
}

function run(cmd, ...args) {
	console.log('\n>>>', cmd, args.join(' '));

	const result = spawnSync(cmd, args, {
		cwd: TEST_PROJECT_DIR,
		shell: true,
		stdio: 'inherit',
	});

	if (result.status) {
		process.exit(result.status);
	}
}

run('yarn');

run('yarn', 'clean');

run('yarn', 'build');

console.log('\n>>> diff', EXPECTED_BUILD_DIR, ACTUAL_BUILD_DIR, '\n');
if (diff(EXPECTED_BUILD_DIR, ACTUAL_BUILD_DIR)) {
	console.log('\n🔴 BUILDS DIFFER :-(\n');
	process.exit(1);
}
else {
	console.log('\n✅ BUILDS ARE IDENTICAL \\o/\n');
}
