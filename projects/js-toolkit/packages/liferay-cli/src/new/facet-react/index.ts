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
	transformJsonFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import type {Facet, Options} from '../index';

const {
	PkgJson: {addDependencies},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: Facet = {
	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`Generating sample code...`);

		// Configure build tool

		print(info`  Configuring Babel`);

		await renderer.render('.babelrc', options);

		// Create widget

		print(info`  Creating React widget`);

		await renderer.render('src/AppComponent.js', options);
		await renderer.render('src/index.js', options);

		// Add language keys

		const languageFile: FilePath = options.outputPath.join(
			'features/localization/Language.properties'
		);

		if (fs.existsSync(languageFile.asNative)) {
			print(info`  Adding UI strings for English language`);

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

		// Add dependencies when necessary

		if (options.platform === 'portal-agnostic') {
			print(info`  Adding React dependencies`);

			const pkgJsonFile = options.outputPath.join('package.json');

			await transformJsonFile(
				pkgJsonFile,
				pkgJsonFile,
				addDependencies({
					react: '16.8.6',
					'react-dom': '16.8.6',
				})
			);
		}
	},
};

export default facet;
