/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer} from '@liferay/js-toolkit-core';
import fs from 'fs';

import HumanError from '../util/HumanError';
import prompt from '../util/prompt';

import type {Options} from '../index';

export async function processOptions(options: Options): Promise<Options> {
	const outputPath = FilePath.coerce(options.name as string).resolve();

	if (fs.existsSync(outputPath.asNative)) {
		throw new HumanError(`Output directory '${outputPath}' already exists`);
	}

	const answers = await prompt(options, [
		{
			default: toHumanReadable(options.name as string),
			message: 'What is the human readable description of your project?',
			name: 'description',
			type: 'input',
		},
	]);

	return {
		...answers,
		outputPath,
	};
}

export async function render(options: Options): Promise<void> {
	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates'),
		options.outputPath
	);

	await renderer.render('.gitignore', options);
	await renderer.render('README.md', options);
	await renderer.render('package.json', options);
	await renderer.render('assets/.placeholder', options);
}

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
