/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';

import facetAngular from '../facet-angular';
import facetBuildable from '../facet-buildable';
import facetConfiguration from '../facet-configuration';
import facetLocalization from '../facet-localization';
import facetPlainJs from '../facet-plain-js';
import facetPortlet from '../facet-portlet';
import facetProject from '../facet-project';
import facetReact from '../facet-react';
import facetSampleConfiguration from '../facet-sample-configuration';
import facetSampleStyles from '../facet-sample-styles';
import ensureOutputFile from '../util/ensureOutputFile';
import prompt from '../util/prompt';

import type {Options, Target} from '..';

const {
	PkgJson: {addDependencies},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const frameworkFacets = {
	Angular: facetAngular,
	'Plain JavaScript': facetPlainJs,
	React: facetReact,
};
const platforms = ['portal-7.4-ga1', 'portal-agnostic'];

const target: Target = {
	name: 'Liferay Platform Project',

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		options = await facetProject.prompt(useDefaults, options);

		options = await prompt(useDefaults, options, [
			{
				choices: platforms,
				default: platforms[0],
				defaultDescription: `Using target platform: {${platforms[0]}`,
				message: 'Which will be your target platform?',
				name: 'platform',
				type: 'list',
			},
			{
				choices: Object.keys(frameworkFacets),
				default: 'React',
				defaultDescription: 'Using framework: {React}',
				message: 'Which will be your application framework?',
				name: 'framework',
				type: 'list',
			},
		]);

		options = await facetLocalization.prompt(true, options);
		options = await facetConfiguration.prompt(true, options);
		options = await facetPortlet.prompt(useDefaults, options);

		const frameworkFacet = frameworkFacets[options.framework as string];

		if (frameworkFacet) {
			options = await facetBuildable.prompt(true, options);
			options = await frameworkFacet.prompt(useDefaults, options);
			options = await facetSampleStyles.prompt(true, options);
			options = await facetSampleConfiguration.prompt(true, options);
		}

		return options;
	},

	async render(options: Options): Promise<void> {
		await facetProject.render(options);

		print(info`Configuring target platform...`);

		const platform = `@liferay/${options.platform}`;

		print(info`  Adding {${platform}} as a dependency`);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addDependencies({
				[platform]: '^1.0.0',
			})
		);

		await facetLocalization.render(options);
		await facetConfiguration.render(options);
		await facetPortlet.render(options);

		const frameworkFacet = frameworkFacets[options.framework as string];

		if (frameworkFacet) {
			await facetBuildable.render(options);
			await frameworkFacet.render(options);
			await facetSampleStyles.render(options);
			await facetSampleConfiguration.render(options);
		}
	},
};

export default target;
