/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const {
	error: fail,
	print,
	question,
	success,
} = require('liferay-npm-build-tools-common/lib/format');
const {
	default: project,
} = require('liferay-npm-build-tools-common/lib/project');
const path = require('path');
const {createInterface} = require('readline');

const configuration = require('./util/configuration');

const {outputDir, outputFilename} = project.jar;
const outputFile = outputDir.join(outputFilename);

module.exports = async function deploy() {
	if (!fs.existsSync(outputFile.asNative)) {
		print(
			fail`Bundle {${outputFile}} does not exist; please build it before deploying`
		);
		process.exit(1);
	}

	let deployPath = configuration.get('deploy', 'path');

	if (!deployPath) {
		deployPath = await promptForDeployPath();
	}

	if (!deployPath) {
		print(fail`No path to Liferay installation given: cannot deploy`);
		process.exit(1);
	}

	fs.copyFileSync(outputFile.asNative, path.join(deployPath, outputFilename));

	print(success`Bundle {${outputFile}} deployed to {${deployPath}}`);
};

async function promptForDeployPath() {
	const lines = createInterface({
		input: process.stdin,
	});

	print(question`Please enter your local Liferay installation directory`);

	let deployPath;

	for await (const line of lines) {
		deployPath = path.join(line, 'osgi', 'modules');

		if (fs.existsSync(deployPath)) {
			configuration.set('deploy', 'path', deployPath);

			break;
		}
		else {
			print(fail`${deployPath} does not exist`);
			print(
				question`Please enter your local Liferay installation directory`
			);
		}
	}

	return deployPath;
}
