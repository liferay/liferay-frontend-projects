/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import path from 'path';

import build from './build';
import clean from './clean';
import deploy from './deploy';
import start from './start';

const {fail, print, title} = format;

export interface Tasks {
	build?: {(): Promise<void>};
	clean?: {(): Promise<void>};
	deploy?: {(): Promise<void>};
	start?: {(): Promise<void>};
}

export default async function run(
	platformPath: string,
	taskOverrides: Tasks
): Promise<void> {
	if (process.argv.length < 3) {
		print(fail`No command provided`);
		process.exit(1);
	}

	const cmd = process.argv[2];

	/* eslint-disable-next-line */
	const pkgJson = require(path.join(platformPath, 'package.json'));
	const tasks: Tasks = {
		build,
		clean,
		deploy,
		start,
		...(taskOverrides || {}),
	};

	switch (cmd) {
		case 'build':
			print(
				title`Building project for target platform: {${pkgJson.name}}`
			);
			await tasks.build();
			break;

		case 'clean':
			print(title`Cleaning output folders`);
			await tasks.clean();
			break;

		case 'deploy':
			print(title`Deploying project to Liferay local installation`);
			await tasks.deploy();
			break;

		case 'start':
			print(title`Starting project live development server`);
			await tasks.start();
			break;

		default:
			print(fail`Unknown command: {${cmd}}`);
			process.exit(1);
	}
}
