/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import checkForUpdate from 'update-check';

interface Arguments {
	$0: string;
	_: string[];
	batch?: boolean;
	name?: string;
	options?: string;
}

const {fail, print, warn} = format;

/** Default entry point for the @liferay/cli executable. */
export default async function (argv: Arguments): Promise<void> {
	await warnIfNewerVersionAvailable();

	switch (argv._[0]) {
		case 'adapt':
			return await run('./adapt', argv.batch, argv.options);

		case 'build':
		case 'clean':
		case 'deploy':
		case 'start':
			return await run('./runLiferayCli', ...process.argv.slice(2));

		case 'docs':
			return await run('./showDocs');

		case 'new':
			return await run('./new', argv.name, argv.batch, argv.options);

		case 'upgrade-project':
			return await run('./upgradeProject');

		default:
			print(fail`Unknown command provided: {${argv._[0]}}`);
			process.exit(1);
	}
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
async function run(moduleName: string, ...args: any[]): Promise<void> {
	/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
	await require(moduleName).default(...args);
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
