/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer} from '@liferay/js-toolkit-core';

import prompt from '../util/prompt';

import type {Options} from '../index';

export async function processOptions(options: Options): Promise<Options> {
	return await prompt(options, [
		{
			default: true,
			message: 'Do you want to add localization support?',
			name: 'addLocalizationSupport',
			type: 'confirm',
		},
	]);
}

export async function render(options: Options): Promise<void> {
	if (!options.addLocalizationSupport) {
		return;
	}

	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates'),
		options.outputPath
	);

	await renderer.render('features/localization/Language.properties', options);
}
