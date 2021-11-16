/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import {createInterface} from 'readline';

import * as configuration from './util/configuration';

const {fail, print, question, success} = format;

const outputDir = new FilePath(project.jar.outputDir.asNative);
const outputFilename = project.jar.outputFilename;

const outputFile = outputDir.join(outputFilename);

export default async function deploy(): Promise<void> {
	if (!fs.existsSync(outputFile.asNative)) {
		print(
			fail`Bundle {${outputFile}} does not exist; please build it before deploying`
		);
		process.exit(1);
	}

	let deployPath = configuration.get('deploy', 'path') as string;

	if (!deployPath) {
		deployPath = await promptForDeployPath();
	}

	if (!deployPath) {
		print(fail`No path to Liferay installation given: cannot deploy`);
		process.exit(1);
	}

	fs.copyFileSync(outputFile.asNative, path.join(deployPath, outputFilename));

	print(success`Bundle {${outputFile}} deployed to {${deployPath}}`);
}

async function promptForDeployPath(): Promise<string> {
	const lines = createInterface({
		input: process.stdin,
	});

	print(question`Please enter your local Liferay installation directory`);

	let deployPath: string;

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
