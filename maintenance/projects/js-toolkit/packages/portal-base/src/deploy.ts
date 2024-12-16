/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';

import configureDeploy from './configureDeploy';

const {fail, info, print, success, warn} = format;

export default async function deploy(): Promise<void> {
	const project = new Project('.');

	if (!project.deploy.dir) {
		print(
			'',
			warn`There's no deploy configuration for the project yet`,
			'',
			info`The Deploy configuration wizard will be run before doing anything.`
		);

		await configureDeploy();

		project.reload();
	}

	const deployDir = project.deploy.dir;

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
