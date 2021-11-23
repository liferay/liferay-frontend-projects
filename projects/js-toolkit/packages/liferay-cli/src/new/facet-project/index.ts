/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';
import fs from 'fs';

import prompt from '../../util/prompt';
import toHumanReadable from '../../util/toHumanReadable';

import type {Facet, Options} from '../index';

const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		const answers = await prompt(useDefaults, options, [
			{
				default: toHumanReadable(options.name),
				message:
					'What is the human readable description of your project?',
				name: 'description',
				type: 'input',
			},
		]);

		return {
			...options,
			...answers,
		};
	},

	async render(options: Options): Promise<void> {
		print(info`Creating project structure`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		await renderer.render('.gitignore', options);
		await renderer.render('.npmignore', options);
		await renderer.render('README.md', options);
		await renderer.render('package.json', options);

		fs.mkdirSync(options.outputPath.join('src').asNative);
	},
};

export default facet;
