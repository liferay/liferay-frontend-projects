/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TemplateRenderer,
	addConfigurationField,
	addPkgJsonDependencies,
	addPkgJsonScripts,
	appendLines,
	transformJsonFile,
	transformTextFile,
} from '@liferay/js-toolkit-core';
import fs from 'fs';

import * as facetConfiguration from '../facet-configuration';
import * as facetLocalization from '../facet-localization';
import * as facetPortlet from '../facet-portlet';
import * as facetProject from '../facet-project';
import prompt from '../util/prompt';

import type {Options} from '..';

export const name = 'Liferay Platform Project';

export async function processOptions(options: Options): Promise<Options> {
	options = await facetProject.processOptions(options);

	options = await prompt(options, [
		{
			choices: ['portal-7.4-ga1'],
			default: 'portal-7.4-ga1',
			message: 'What will be your target platform?',
			name: 'platform',
			type: 'list',
		},
	]);

	options = await facetLocalization.processOptions(options);
	options = await facetPortlet.processOptions(options);
	options = await facetConfiguration.processOptions(options);

	return options;
}

export async function render(options: Options): Promise<void> {
	await facetProject.render(options);
	await facetLocalization.render(options);
	await facetPortlet.render(options);
	await facetConfiguration.render(options);

	const renderer = new TemplateRenderer(
		new FilePath(__dirname).join('templates'),
		options.outputPath
	);

	await renderer.render('src/AppComponent.js', options);
	await renderer.render('src/index.js', options);

	// Add target platform to project dependencies

	const pkgJsonFile = options.outputPath.join('package.json');

	await transformJsonFile(
		pkgJsonFile,
		pkgJsonFile,
		addPkgJsonDependencies({
			[`@liferay/${options.platform}`]: '^1.0.0',
		}),
		addPkgJsonScripts({
			build: 'liferay build',
		})
	);

	// Add language keys

	const languageFile: FilePath = options.outputPath.join(
		'features/localization/Language.properties'
	);

	if (fs.existsSync(languageFile.asNative)) {
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
		await transformJsonFile(
			configurationFile,
			configurationFile,
			addConfigurationField('system', 'fruit', {
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
			addConfigurationField('portletInstance', 'drink', {
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
}
