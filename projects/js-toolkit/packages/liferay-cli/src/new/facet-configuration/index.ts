/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	TemplateRenderer,
	format,
	transformTextFile,
} from '@liferay/js-toolkit-core';

import ensureOutputFile from '../../util/ensureOutputFile';
import prompt from '../../util/prompt';

import type {Facet, Options} from '../index';

const {
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return await prompt(useDefaults, options, [
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
	},

	async render(options: Options): Promise<void> {
		if (!options.addConfigurationSupport) {
			return;
		}

		print(info`Adding configuration support to project...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Creating {configuration.json} file`);

		/* eslint-disable-next-line @liferay/no-dynamic-require, @typescript-eslint/no-var-requires */
		const pkgJson = require(ensureOutputFile(options, 'package.json')
			.asNative);

		const context = {
			category: pkgJson.name,
			name: pkgJson.name,
		};

		await renderer.render('features/configuration.json', context);

		if (options.addLocalizationSupport) {
			print(info`  Adding configuration name for English language`);

			const languageFile = ensureOutputFile(
				options,
				'features/localization/Language.properties'
			);

			await transformTextFile(
				languageFile,
				languageFile,
				appendLines(`${context.name}=${pkgJson.name}`)
			);
		}
	},
};

export default facet;
