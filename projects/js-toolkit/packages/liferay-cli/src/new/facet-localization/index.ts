/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';

import prompt from '../util/prompt';

import type {Facet, Options} from '../index';

const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: true, options: Options): Promise<Options> {
		return await prompt(useDefaults, options, [
			{
				default: true,
				message: 'Do you want to add localization support?',
				name: 'addLocalizationSupport',
				type: 'confirm',
			},
		]);
	},

	async render(options: Options): Promise<void> {
		if (!options.addLocalizationSupport) {
			return;
		}

		print(info`Adding localization support to project...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		await renderer.render(
			'features/localization/Language.properties',
			options
		);
	},
};

export default facet;
