/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, TemplateRenderer, format} from '@liferay/js-toolkit-core';

import prompt from '../../util/prompt';

import type {Options} from '../index';
import type {LiferayTargetFacet} from '../target-liferay';

const {info, print} = format;

const facet: LiferayTargetFacet = {
	isPortlet: false,

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return await prompt(useDefaults, options, [
			{
				type: 'confirm',
				name: 'createInitializer',
				message:
					'Does your shared bundle need an initializer?\n' +
					'\n' +
					'  💡 This is usually needed in frameworks which need a single point of\n' +
					'     initialization.\n' +
					'  💡 It may also be useful if you need to load any polyfill that must be\n' +
					'     loaded just once.\n' +
					'\n',
				default: false,
			},
		]);
	},

	async render(options: Options): Promise<void> {
		if (!options['createInitializer']) {
			return;
		}

		print(info`Generating initializer...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Configuring Babel`);

		await renderer.render('.babelrc', options);

		print(info`  Creating initializer`);

		await renderer.render('src/index.js', options);
	},
};

export default facet;
