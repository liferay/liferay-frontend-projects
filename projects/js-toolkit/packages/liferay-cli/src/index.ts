/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import checkForUpdate from 'update-check';

import newProject from './new';
import runLiferayCli from './runLiferayCli';

interface Arguments {
	_: string[];
	$0: string;
	batch?: boolean;
	name?: string;
}

const {error: fail, print, warn} = format;

/** Default entry point for the @liferay/cli executable. */
export default async function (argv: Arguments): Promise<void> {
	await warnIfNewerVersionAvailable();

	switch (argv._[0]) {
		case 'build':
		case 'clean':
		case 'deploy':
			return await runLiferayCli(...process.argv.slice(2));

		case 'new':
			return await newProject(argv.name, argv.batch);

		default:
			print(fail`Uknown command provided: {${argv._[0]}}`);
			process.exit(1);
	}
}

async function warnIfNewerVersionAvailable(): Promise<void> {
	try {
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const packageJson = require('../package.json');
		const update = await checkForUpdate(packageJson, {

			// Check every 3 days

			interval: 3 * 24 * 60 * 60 * 1000,
		});

		print(
			'',
			warn`There is a newer version of {@liferay/cli} available`,
			warn`We recommend updating to version {${update.latest}} as soon as possible!`,
			'',
			'You can do that using the {npm update} or {yarn upgrade} commands:',
			'',
			'  · {npm}: https://docs.npmjs.com/cli/v7/commands/npm-update',
			'  · {yarn}: https://classic.yarnpkg.com/en/docs/cli/upgrade/',
			'',
			''
		);
	}
	catch (error) {

		// ignore

	}
}
