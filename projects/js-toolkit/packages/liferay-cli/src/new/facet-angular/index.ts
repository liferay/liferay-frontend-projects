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

import ensureOutputFile from '../../util/ensureOutputFile';

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
		await renderer.render('src/app/dynamic.loader.ts', context);
		await renderer.render('src/app/app.module.ts', context);
		await renderer.render('src/types/LiferayParams.ts', context);
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
			addDependencies({
				'@angular/animations': '10.2.2',
				'@angular/common': '10.2.2',
				'@angular/compiler': '10.2.2',
				'@angular/core': '10.2.2',
				'@angular/forms': '10.2.2',
				'@angular/platform-browser': '10.2.2',
				'@angular/platform-browser-dynamic': '10.2.2',
				'@angular/router': '10.2.2',
				rxjs: '6.6.3',
				tslib: '2.0.3',
				'zone.js': '0.10.3',
			}),
			addDependencies(
				{
					'@angular/cli': '10.2.0',
					'@angular/compiler-cli': '10.2.2',
					'@angular-devkit/build-angular': '0.1002.0',
					'@types/jasmine': '3.5.14',
					'@types/jasminewd2': '2.0.8',
					'@types/node': '12.11.1',
					codelyzer: '6.0.1',
					'jasmine-core': '3.6.0',
					'jasmine-spec-reporter': '5.0.2',
					karma: '5.0.9',
					'karma-chrome-launcher': '3.1.0',
					'karma-coverage-istanbul-reporter': '3.0.3',
					'karma-jasmine': '4.0.1',
					'karma-jasmine-html-reporter': '1.5.4',
					protractor: '7.0.0',
					'ts-node': '8.3.0',
					tslint: '6.1.3',
					typescript: '4.0.5',
				},
				'dev'
			)
		);
	},
};

export default facet;
