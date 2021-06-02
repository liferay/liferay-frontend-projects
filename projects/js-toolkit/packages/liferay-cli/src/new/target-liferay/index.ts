/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	FilePath,
	TemplateRenderer,
	addPkgJsonDependencies,
	addPkgJsonScripts,
	transformJsonFile,
} from '@liferay/js-toolkit-core';

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
}
