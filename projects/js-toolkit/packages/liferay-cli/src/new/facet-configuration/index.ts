/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TemplateRenderer,
	TRANSFORM_OPERATIONS,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import prompt from '../util/prompt';

import type {Options} from '../index';

const {
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;

export async function processOptions(options: Options): Promise<Options> {
	return await prompt(options, [
		{
			default: true,
			message:
				'Do you want to add configuration support?\n' +
				'\n' +
				'  💡 Needs Liferay DXP/Portal CE 7.1 with JS Portlet Extender 1.1.0 or\n' +
				'     Liferay DXP/Portal CE 7.2+.\n' +
				'\n',
			name: 'addConfigurationSupport',
			type: 'confirm',
		},
	]);
}

export async function render(options: Options): Promise<void> {
	if (!options.addConfigurationSupport) {
		return;
	}

	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates'),
		options.outputPath
	);

	const pkgJsonFile = options.outputPath.join('package.json');
	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
	const pkgJson = require(pkgJsonFile.asNative);

	const context = {
		category: pkgJson.name,
		name: pkgJson.name,
	};

	await renderer.render('features/configuration.json', context);

	// Add configuration name localization key

	const languageFile: FilePath = options.outputPath.join(
		'features/localization/Language.properties'
	);

	if (fs.existsSync(languageFile.asNative)) {
		await transformTextFile(
			languageFile,
			languageFile,
			appendLines(`${context.name}=${pkgJson.name}`)
		);
	}
}
