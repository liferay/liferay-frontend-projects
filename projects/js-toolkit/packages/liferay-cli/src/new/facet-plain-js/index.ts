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

import type {Facet, Options} from '../index';

const {
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		print(info`Generating sample code...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Configuring Babel`);

		await renderer.render('.babelrc', options);

		print(info`  Creating JavaScript widget`);

		await renderer.render('src/index.js', options);

		if (options.addLocalizationSupport) {
			print(info`  Adding labels for English language`);

			const languageFile = ensureOutputFile(
				options,
				'features/localization/Language.properties'
			);

			await transformTextFile(
				languageFile,
				languageFile,
				appendLines(
					'configuration=Configuration',
					'context-path=Context Path',
					'portlet-element-id=Portlet Element ID',
					'portlet-namespace=Portlet Namespace'
				)
			);
		}
	},
};

export default facet;
