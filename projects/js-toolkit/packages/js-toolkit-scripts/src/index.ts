/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';

import build from './scripts/build';
import copyAssets from './scripts/copy-assets';
import copySources from './scripts/copy-sources';
import createJar from './scripts/create-jar';
import deploy from './scripts/deploy';
import start from './scripts/start';
import translate from './scripts/translate';

const {error, info, print} = format;

const COMMANDS = {
	build: {
		description: 'generate bundled files in build folder',
		scriptFunction: build,
	},
	'copy-assets': {
		description: 'copy files from assets to build folder',
		scriptFunction: copyAssets,
	},
	'copy-sources': {
		description: 'copy static files from source to build folder',
		scriptFunction: copySources,
	},
	'create-jar': {
		description: 'create a JAR file from bundled files',
		scriptFunction: createJar,
	},
	deploy: {
		description: 'deploy JAR file to local Liferay server',
		scriptFunction: deploy,
	},
	start: {
		description: 'start webpack devserver (deprecated)',
		scriptFunction: start,
	},
	translate: {
		description: 'pass project labels through Microsoft Translator',
		scriptFunction: translate,
	},
};

export default async function main(): Promise<void> {
	const scripts = process.argv.slice(2);

	if (scripts.length === 0) {
		print(error`No scripts to run were specified`);
		showUsage();
		process.exit(1);
	}

	const unknownScripts = scripts.filter((script) => !COMMANDS[script]);

	if (unknownScripts.length > 0) {
		print(error`Unknown scripts found: ${unknownScripts.join(', ')}'`);
		showUsage();
		process.exit(1);
	}

	for (const script of scripts) {
		try {
			const {scriptFunction} = COMMANDS[script];

			await scriptFunction();
		}
		catch (scriptError) {
			print(
				error`Script 'js-toolkit ${script}' failed:\n${scriptError.stack}`
			);
			process.exit(1);
		}
	}
}

function showUsage(): void {
	print(
		'',
		info`
			Supported scripts are:
			${Object.entries(COMMANDS)
				.map(([id, {description}]) => `    {${id}}: ${description}`)
				.join('\n')}
		`
	);
}
