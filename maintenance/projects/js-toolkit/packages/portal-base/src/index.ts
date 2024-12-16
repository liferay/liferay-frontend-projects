/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';
import path from 'path';

import build from './build';
import clean from './clean';
import configureBuild from './configureBuild';
import configureDeploy from './configureDeploy';
import configureStart from './configureStart';
import deploy from './deploy';
import prepareStart from './prepareStart';
import start from './start';

const {fail, print, title} = format;

export interface Tasks {
	build?: {(): Promise<void>};
	clean?: {(): Promise<void>};
	configureBuild?: {(): Promise<void>};
	configureDeploy?: {(): Promise<void>};
	configureStart?: {(): Promise<void>};
	deploy?: {(): Promise<void>};
	prepareStart?: {(): Promise<void>};
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
		configureBuild,
		configureDeploy,
		configureStart,
		deploy,
		prepareStart,
		start,
		...(taskOverrides || {}),
	};

	const project = new Project('.');

	switch (cmd) {
		case 'build':
			if (isSwitchEnabled('configure')) {
				await tasks.configureBuild();
			}
			else {
				print(
					title`Building project for target platform: {${pkgJson.name}}`
				);
				await tasks.build();
			}
			break;

		case 'clean':
			print(title`Cleaning output folders`);
			await tasks.clean();
			break;

		case 'deploy':
			if (project.isWorkspace) {
				print(
					fail`
Your project cannot be deployed from npm because it is inside a Liferay
workspace.

Please use Gradle's command {gw deploy} instead.

> Note, you must also have a 'client-extension.yaml' for 'gw deploy' to work properly.
`
				);
			}
			else {
				if (isSwitchEnabled('configure')) {
					await tasks.configureDeploy();
				}
				else {
					if (!isSwitchEnabled('only')) {
						print(
							title`Building project for target platform: {${pkgJson.name}}`
						);
						await tasks.build();
					}
					print(
						title`Deploying project to Liferay local installation`
					);
					await tasks.deploy();
				}
			}
			break;

		case 'start':
			if (project.isWorkspace) {
				print(title`Starting project live development server`);
				await tasks.start();
			}
			else {
				if (isSwitchEnabled('configure')) {
					await tasks.configureStart();
				}
				else {
					if (!isSwitchEnabled('only')) {
						print(
							title`Deploying live project to Liferay local installation`
						);
						await tasks.prepareStart();
					}
					print(title`Starting project live development server`);
					await tasks.start();
				}
			}
			break;

		default:
			print(fail`Unknown command: {${cmd}}`);
			process.exit(1);
	}
}

function isSwitchEnabled(name: string): boolean {
	return !!process.argv.find((arg) => arg === `--${name}`);
}
