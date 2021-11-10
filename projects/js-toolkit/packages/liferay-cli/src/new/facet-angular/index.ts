/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TRANSFORM_OPERATIONS,
	TemplateRenderer,
	format,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';

import dependencies from '../../dependencies.json';
import ensureOutputFile from '../../util/ensureOutputFile';

import type {Options} from '../index';
import type {LiferayTargetFacet} from '../target-liferay';

const {
	PkgJson: {addDependencies},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const facet: LiferayTargetFacet = {
	isPortlet: true,

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		return options;
	},

	async render(options: Options): Promise<void> {
		print(info`Generating sample code...`);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');
		/* eslint-disable-next-line @typescript-eslint/no-var-requires, @liferay/no-dynamic-require */
		const pkgJson = require(pkgJsonFile.asNative);

		const context = {
			...options,
			pkgJson,
		};

		print(info`  Configuring TypeScript compiler`);

		await renderer.render('tsconfig.json', context);

		print(info`  Creating Angular application`);

		await renderer.render('src/app/app.component.html', context);
		await renderer.render('src/app/app.component.ts', context);
		await renderer.render('src/app/app.dynamic.loader.ts', context);
		await renderer.render('src/app/app.module.ts', context);
		await renderer.render('src/app/app.url.resolver.ts', context);
		await renderer.render('src/types/base.url.map.ts', context);
		await renderer.render('src/types/liferay.params.ts', context);
		await renderer.render('src/polyfills.ts', context);
		await renderer.render('src/index.ts', context);

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

		print(info`  Adding Angular dependencies`);

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addDependencies(dependencies['facet-angular']['dependencies']),
			addDependencies(
				dependencies['facet-angular']['devDependencies'],
				'dev'
			)
		);
	},
};

export default facet;
