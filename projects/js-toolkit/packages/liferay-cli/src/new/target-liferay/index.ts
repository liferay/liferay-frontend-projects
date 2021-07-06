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
import fs from 'fs';

import facetConfiguration from '../facet-configuration';
import facetLocalization from '../facet-localization';
import facetPortlet from '../facet-portlet';
import facetProject from '../facet-project';
import prompt from '../util/prompt';

import type {Options, Target} from '..';

const {
	ConfigurationJson: {addField},
	PkgJson: {addDependencies, addScripts},
	Text: {appendLines},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const target: Target = {
	name: 'Liferay Platform Project',

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		options = await facetProject.prompt(useDefaults, options);

		options = await prompt(useDefaults, options, [
			{
				choices: ['portal-7.4-ga1'],
				default: 'portal-7.4-ga1',
				defaultDescription: 'Using target platform: {portal-7.4-ga1}',
				message: 'What will be your target platform?',
				name: 'platform',
				type: 'list',
			},
		]);

		options = await facetLocalization.prompt(true, options);
		options = await facetPortlet.prompt(useDefaults, options);
		options = await facetConfiguration.prompt(true, options);

		return options;
	},

	async render(options: Options): Promise<void> {
		await facetProject.render(options);
		await facetLocalization.render(options);
		await facetPortlet.render(options);
		await facetConfiguration.render(options);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`Generating sample code...`);

		print(info`  Creating React widget`);

		await renderer.render('src/AppComponent.js', options);
		await renderer.render('src/index.js', options);

		// Add gitignores

		const gitignoreFile = options.outputPath.join('.gitignore');

		print(info`  Configuring .gitignore file`);

		await transformTextFile(
			gitignoreFile,
			gitignoreFile,
			appendLines('/build', '/dist')
		);

		// Add target platform to project dependencies

		const pkgJsonFile = options.outputPath.join('package.json');

		print(info`  Configuring target platform and build`);

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addDependencies({
				[`@liferay/${options.platform}`]: '^1.0.0',
			}),
			addScripts({
				build: 'liferay build',
				clean: 'liferay clean',
				deploy: 'liferay deploy',
			})
		);

		// Add language keys

		const languageFile: FilePath = options.outputPath.join(
			'features/localization/Language.properties'
		);

		if (fs.existsSync(languageFile.asNative)) {
			print(info`  Adding strings for English language`);

			await transformTextFile(
				languageFile,
				languageFile,

				// Portlet UI keys

				appendLines(
					'configuration=Configuration',
					'context-path=Context Path',
					'portlet-element-id=Portlet Element ID',
					'portlet-namespace=Portlet Namespace'
				),

				// Configuration keys

				appendLines(
					'fruit=Favorite fruit',
					'fruit-help=Choose the fruit you like the most',
					'an-orange=An orange',
					'a-pear=A pear',
					'an-apple=An apple',
					'drink=Favorite drink',
					'drink-help=Choose the drink you like the most',
					'coffee=Coffee',
					'tea=Tea',
					'water=Water'
				)
			);
		}

		// Add CSS styles

		const stylesFile: FilePath = options.outputPath.join(
			'assets/css/styles.css'
		);

		if (fs.existsSync(stylesFile.asNative)) {
			print(info`  Adding CSS styles`);

			await transformTextFile(
				stylesFile,
				stylesFile,
				appendLines(
					'.pre {',
					'	font-family: monospace;',
					'	white-space: pre;',
					'}',
					'',
					'.tag {',
					'	font-weight: bold;',
					'	margin-right: 1em;',
					'}',
					'',
					'.value {',
					'	font-family: monospace;',
					'}'
				)
			);
		}

		// Add configuration fields

		const configurationFile: FilePath = options.outputPath.join(
			'features/configuration.json'
		);

		if (fs.existsSync(configurationFile.asNative)) {
			print(
				info`  Adding System Settings Configuration schema`,
				info`  Adding Portlet Instance Configuration schema`
			);

			await transformJsonFile(
				configurationFile,
				configurationFile,
				addField('system', 'fruit', {
					default: 'orange',
					description: 'fruit-help',
					name: 'fruit',
					options: {
						apple: 'an-apple',
						orange: 'an-orange',
						pear: 'a-pear',
					},
					required: false,
					type: 'string',
				}),
				addField('portletInstance', 'drink', {
					default: 'water',
					description: 'drink-help',
					name: 'drink',
					options: {
						coffee: 'coffee',
						tea: 'tea',
						water: 'water',
					},
					required: false,
					type: 'string',
				})
			);
		}
	},
};

export default target;
