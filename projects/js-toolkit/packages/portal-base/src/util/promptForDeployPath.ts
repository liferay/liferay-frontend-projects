/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import {createInterface} from 'readline';

const {fail, print, question} = format;

export default async function promptForDeployPath(
	project: Project
): Promise<FilePath> {
	const lines = createInterface({
		input: process.stdin,
	});

	print(question`Please enter your local Liferay installation directory`);

	let deployDir: FilePath;

	for await (const line of lines) {
		deployDir = new FilePath(line).join('osgi', 'modules').resolve();

		if (fs.existsSync(deployDir.asNative)) {
			project.deploy.storeDir(deployDir);

			break;
		}
		else {
			print(fail`${deployDir.asNative} does not exist`);
			print(
				question`Please enter your local Liferay installation directory`
			);
		}
	}

	return deployDir;
}
