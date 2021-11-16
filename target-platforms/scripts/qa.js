/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const {spawnSync} = require('child_process');
const {createHash} = require('crypto');
const fs = require('fs');
const path = require('path');

const TOKENIZED_FILES = ['.css.map', '.json'];

function diff(expectedDir, actualDir, tokens) {
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
				somethingChanged || diff(expectedFile, actualFile, tokens);
		}
		else if (!actualItems.includes(expectedItem)) {
			somethingChanged = true;
			console.log('-', path.join(actualDir, expectedItem));
		}
		else {
			const expectedContent = readExpected(expectedFile, tokens);
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

			/*

			console.log('<<<<<<<<<<<<<<<<<<');
			console.log(expectedContent);
			console.log('==================');
			console.log(actualContent.toString());
			console.log('>>>>>>>>>>>>>>>>>>');

			*/
		}
	}

	return somethingChanged;
}

function getTargetPlatformVersion(projectDir) {
	/* eslint-disable-next-line @liferay/no-dynamic-require */
	const projectPackageJson = require(path.join(projectDir, 'package.json'));

	// Should be the only dependency, so no need to look for it

	return Object.values(projectPackageJson.dependencies)[0];
}

function readExpected(file, tokens) {
	let content = fs.readFileSync(file).toString();

	const fileNameLowerCase = file.toLowerCase();

	if (!TOKENIZED_FILES.find((suffix) => fileNameLowerCase.endsWith(suffix))) {
		return content;
	}

	Object.entries(tokens).forEach(([key, value]) => {
		content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
	});

	return content;
}

function run(projectName, cmd, ...args) {
	console.log('\n>>>', cmd, args.join(' '));

	const result = spawnSync(cmd, args, {
		cwd: path.resolve(__dirname, `../qa/${projectName}`),
		shell: true,
		stdio: 'inherit',
	});

	if (result.status) {
		process.exit(result.status);
	}
}

function runQAFor(projectName) {
	run(projectName, 'yarn');

	run(projectName, 'yarn', 'clean');

	run(projectName, 'yarn', 'build');

	const projectDir = path.resolve(__dirname, '..', 'qa', projectName);
	const actualBuildDir = path.join(projectDir, 'build');
	const expectedBuildDir = path.join(projectDir, 'build.expected');

	const tokens = {
		TARGET_PLATFORM_VERSION: getTargetPlatformVersion(projectDir),
		WORKSPACE_DIR: path.resolve(__dirname, '..', '..'),
	};

	console.log('\n>>> diff', expectedBuildDir, actualBuildDir, '\n');
	if (diff(expectedBuildDir, actualBuildDir, tokens)) {
		console.log('\n🔴 BUILDS DIFFER :-(\n');
		process.exit(1);
	}
	else {
		console.log('\n✅ BUILDS ARE IDENTICAL \\o/\n');
	}
}

// Launch QA tests

runQAFor('test-portal-7.4-ga1');
