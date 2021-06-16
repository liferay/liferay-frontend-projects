/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import path from 'path';

import prompt from './util/prompt';

const {error: fail, info, print, success, text, title} = format;

export type OptionValue = FilePath | boolean | number | string;

export interface Options {
	name: string;
	outputPath: FilePath;
	target?: string;
	[key: string]: OptionValue;
}

export interface Facet {
	prompt(useDefaults: boolean, options: Options): Promise<Options>;
	render(options: Options): Promise<void>;
}

export interface Target extends Facet {
	name: string;
}

export default async function newProject(
	name: string,
	batch?: boolean
): Promise<void> {
	try {
		/* eslint-disable-next-line @typescript-eslint/no-var-requires */
		const {version} = require('../../package.json');

		print('', title`|👋 |Welcome to Liferay Project Generator v${version}`);

		const outputPath = FilePath.coerce(name).resolve();

		if (fs.existsSync(outputPath.asNative)) {
			print(
				fail`Output directory '${outputPath.basename()}' already exists`
			);
			process.exit(1);
		}

		print(
			'',
			text`⚙ Gathering information to create project...`,
			info`Using project name: {${name}}`
		);

		let options: Options = {
			name,
			outputPath,
		};

		const targets = loadTargets();

		if (targets.length === 1) {
			const target = targets[0];

			print(info`Using project type: {${target.name}}`);

			options.target = target.name;
		}
		else {
			options = await prompt(batch, options, [
				{
					choices: targets.map((target) => target.name),
					default: targets[0].name,
					message: 'What type of project do you want to create?',
					name: 'target',
					type: 'list',
				},
			]);
		}

		const target = targets.find((target) => target.name === options.target);

		options = await target.prompt(batch, options);

		print('', text`⚙ Generating project...`);

		await target.render(options);

		print('', success`{Project has been generated successfully!}`);

		print(text`

			  You can now run the following commands to build your project:

			      $ {cd ${name}| ↩|}
			      $ {npm install| ↩|} 
			      $ {npm run build| ↩|} 

			  This will create a {${name}.jar} file in your {${path.join(name, 'dist')}}
			  folder that you can deploy to your local Liferay server.

		`);
	}
	catch (error) {
		print(fail`Could not generate project due to error:`);
		print(text`${error.stack}`);
	}
}

function loadTargets(): Target[] {
	return (
		fs
			.readdirSync(__dirname, {withFileTypes: true})
			.filter((dirent) => dirent.isDirectory())
			.filter((dirent) => dirent.name.startsWith('target-'))
			/* eslint-disable-next-line @liferay/liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
			.map((dirent) => require(`./${dirent.name}`).default)
	);
}
