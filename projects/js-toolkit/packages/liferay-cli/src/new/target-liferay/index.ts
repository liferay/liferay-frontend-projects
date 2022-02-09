/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	TRANSFORM_OPERATIONS,
	format,
	transformJsonFile,
} from '@liferay/js-toolkit-core';
import path from 'path';

import dependencies from '../../dependencies.json';
import ensureOutputFile from '../../util/ensureOutputFile';
import prompt from '../../util/prompt';
import facetAngular from '../facet-angular';
import facetBuildable from '../facet-buildable';
import facetConfiguration from '../facet-configuration';
import facetDeployable from '../facet-deployable';
import facetLocalization from '../facet-localization';
import facetPlainJs from '../facet-plain-js';
import facetPortlet from '../facet-portlet';
import facetProject from '../facet-project';
import facetReact from '../facet-react';
import facetSampleConfiguration from '../facet-sample-configuration';
import facetSampleStyles from '../facet-sample-styles';
import facetSharedBundle from '../facet-shared-bundle';
import facetVuejs from '../facet-vuejs';

import type {Facet, Options, Target} from '..';

export interface LiferayTargetFacet extends Facet {
	isPortlet: boolean;
}

const {
	PkgJson: {addDependencies},
} = TRANSFORM_OPERATIONS;
const {info, print, success, text} = format;

const projectTypeFacets: {[name: string]: LiferayTargetFacet} = {
	'Angular': facetAngular,
	'Plain JavaScript': facetPlainJs,
	'React': facetReact,
	'Shared bundle': facetSharedBundle,
	'Vue.js': facetVuejs,
};
const platforms = dependencies['target-liferay']['platforms'];

const target: Target = {
	name: 'Liferay Platform Project',

	async prompt(useDefaults: boolean, options: Options): Promise<Options> {
		options = await facetProject.prompt(useDefaults, options);

		options = await prompt(useDefaults, options, [
			{
				choices: Object.entries(platforms).map(([value, name]) => ({
					name,
					value,
				})),
				default: Object.entries(platforms)[0][0],
				defaultDescription: `Using target platform: {${
					Object.entries(platforms)[0][0]
				}}`,
				message: 'Which will be your target platform?',
				name: 'platform',
				type: 'list',
			},
			{
				choices: Object.keys(projectTypeFacets),
				default: 'React',
				defaultDescription: 'Using project type: {React}',
				message: 'Which will be your project type?',
				name: 'projectType',
				type: 'list',
			},
		]);

		const projectTypeFacet =
			projectTypeFacets[options.projectType as string];

		options = await facetLocalization.prompt(
			useDefaults || projectTypeFacet.isPortlet,
			options
		);
		options = await facetConfiguration.prompt(
			useDefaults || projectTypeFacet.isPortlet,
			options
		);

		if (projectTypeFacet.isPortlet) {
			options = await facetPortlet.prompt(useDefaults, options);
		}

		options = await facetBuildable.prompt(true, options);
		options = await facetDeployable.prompt(true, options);
		options = await projectTypeFacet.prompt(useDefaults, options);

		if (projectTypeFacet.isPortlet) {
			options = await facetSampleStyles.prompt(true, options);
		}

		options = await facetSampleConfiguration.prompt(true, options);

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
				[platform]: '*',
			})
		);

		const projectTypeFacet =
			projectTypeFacets[options.projectType as string];

		await facetLocalization.render(options);
		await facetConfiguration.render(options);

		if (projectTypeFacet.isPortlet) {
			await facetPortlet.render(options);
		}

		await facetBuildable.render(options);
		await facetDeployable.render(options);
		await projectTypeFacet.render(options);

		if (projectTypeFacet.isPortlet) {
			await facetSampleStyles.render(options);
		}

		await facetSampleConfiguration.render(options);

		const {name} = options;

		print(
			'',
			success`{Project has been generated successfully!}`,
			'',
			text`
You can now run the following commands to build your project:

    $ {cd ${name}| ↩|}
    $ {npm install| ↩|} 
    $ {npm run build| ↩|} 

This will create a {${name}.jar} file in your {${path.join(name, 'dist')}}
folder that you can deploy to your local Liferay server.
`
		);
	},
};

export default target;
