/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';

import promptForDeployPath from './util/promptForDeployPath';

const {fail, print, success} = format;

export default async function deploy(): Promise<void> {
	const project = new Project('.');

	let deployDir = project.deploy.dir;

	if (!deployDir) {
		deployDir = await promptForDeployPath(project);
	}

	if (!deployDir) {
		print(fail`No path to Liferay installation given: cannot deploy`);
		process.exit(1);
	}

	if (!fs.existsSync(project.dist.file.asNative)) {
		print(
			fail`Bundle {${project.dist.file}} does not exist; please build it before deploying`
		);
		process.exit(1);
	}

	fs.copyFileSync(
		project.dist.file.asNative,
		deployDir.join(project.dist.file.basename().asNative).asNative
	);

	print(
		success`Bundle {${
			project.dist.file.basename().asNative
		}} deployed to {${deployDir.asNative}}`
	);
}
