/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';

import facetBuildable from '../facet-buildable';
import facetConfiguration from '../facet-configuration';
import facetLocalization from '../facet-localization';
import facetPlainJs from '../facet-plain-js';
import facetPortlet from '../facet-portlet';
import facetProject from '../facet-project';
import facetReact from '../facet-react';
import facetSampleConfiguration from '../facet-sample-configuration';
import facetSampleStyles from '../facet-sample-styles';
import prompt from '../util/prompt';

import type {Options, Target} from '..';

const {
	PkgJson: {addDependencies},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const frameworkFacets = {
	'Plain JavaScript': facetPlainJs,
	React: facetReact,
};

const target: Target = {
	name: 'Liferay Platform Project',

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		options = await facetProject.prompt(useDefaults, options);

		options = await prompt(useDefaults, options, [
			{
				choices: ['portal-7.4-ga1'],
				default: 'portal-7.4-ga1',
				defaultDescription: 'Using target platform: {portal-7.4-ga1}',
				message: 'Which will be your target platform?',
				name: 'platform',
				type: 'list',
			},
			{
				choices: ['React', 'Plain JavaScript'],
				default: 'React',
				defaultDescription: 'Using framework: {React}',
				message: 'Which will be your application framework?',
				name: 'framework',
				type: 'list',
			},
		]);

		options = await facetLocalization.prompt(true, options);
		options = await facetPortlet.prompt(useDefaults, options);
		options = await facetConfiguration.prompt(true, options);

		const frameworkFacet = frameworkFacets[options.framework as string];

		if (frameworkFacet) {
			options = await frameworkFacet.prompt(useDefaults, options);
			options = await facetSampleConfiguration.prompt(true, options);
			options = await facetSampleStyles.prompt(true, options);
			options = await facetBuildable.prompt(true, options);
		}

		return options;
	},

	async render(options: Options): Promise<void> {
		await facetProject.render(options);
		await facetLocalization.render(options);
		await facetConfiguration.render(options);
		await facetPortlet.render(options);

		// Generate sample code

		const frameworkFacet = frameworkFacets[options.framework as string];

		if (frameworkFacet) {
			await frameworkFacet.render(options);
			await facetSampleConfiguration.render(options);
			await facetSampleStyles.render(options);
			await facetBuildable.render(options);
		}

		// Add target platform to project dependencies

		const pkgJsonFile = options.outputPath.join('package.json');

		print(info`Configuring target platform...`);

		const platform = `@liferay/${options.platform}`;

		print(info`  Adding {${platform}} as a dependency`);

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addDependencies({
				[platform]: '^1.0.0',
			})
		);
	},
};

export default target;
