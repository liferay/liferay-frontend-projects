/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';

import prompt from '../util/prompt';

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
		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`Creating project structure...`);

		await renderer.render('.gitignore', options);
		await renderer.render('README.md', options);
		await renderer.render('package.json', options);
		await renderer.render('assets/.placeholder', options);
	},
};

/**
 * Converts a technical string to human readable form.
 */
function toHumanReadable(string: string): string {
	let capitalizeNext = true;
	let humanizedString = '';

	for (let i = 0; i < string.length; i++) {
		if (string[i].match(/[\\._-]/)) {
			humanizedString += ' ';
			capitalizeNext = true;
		}
		else {
			if (capitalizeNext) {
				humanizedString += string[i].toLocaleUpperCase();
				capitalizeNext = false;
			}
			else {
				humanizedString += string[i];
			}
		}
	}

	return humanizedString;
}

export default facet;
