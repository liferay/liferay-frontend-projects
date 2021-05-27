/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {format} from '@liferay/js-toolkit-core';
import path from 'path';

import * as targetLiferay from './target-liferay';
import HumanError from './util/HumanError';

const {error, info, print, success, text, title} = format;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type OptionValue = any;

export interface Options {
	[key: string]: OptionValue;
}

interface Facet {
	processOptions(options: Options): Promise<Options>;
	render(options: Options): Promise<void>;
}

interface Target extends Facet {
	name: string;
}

export default async function newProject(
	name: string,
	batch?: boolean
): Promise<void> {
	/* eslint-disable-next-line @typescript-eslint/no-var-requires */
	const {version} = require('../../package.json');

	print(title`|👋 |Welcome to Liferay Project Generator v${version}`);

	const target: Target = targetLiferay;

	try {
		print(info`Gathering info to create new project '${name}'...`);

		const options = await target.processOptions({batch, name});

		print(info`Generating new project '${name}'...`);

		await targetLiferay.render(options);
		print(success`Successfully generated new project '${name}'`);
		print(text`

			  You can now run the following commands to build your project:

			      $ {cd ${name}| ↩|}
			      $ {yarn build| ↩|} 

			  This will create a {${name}.jar} file in your {${path.join(name, 'dist')}}
			  folder that you can deploy to your local Liferay server.

		`);
	}
	catch (err) {
		if (err instanceof HumanError) {
			const reason =
				err.message.substring(0, 1).toLocaleLowerCase() +
				err.message.substring(1);

			print(error`Could not generate project: {${reason}}`);
		}
		else {
			print(error`Could not generate project due to error:`);
			print(text`${err.stack}`);
		}
	}
}
