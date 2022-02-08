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
} from '@liferay/js-toolkit-core';

import dependencies from '../../dependencies.json';
import ensureOutputFile from '../../util/ensureOutputFile';
import prompt from '../../util/prompt';
import facetBuildable from '../facet-buildable';
import facetPlainJs from '../facet-plain-js';
import facetProject from '../facet-project';
import facetRemoteAppReact from '../facet-remote-app-react';
import facetStartable from '../facet-startable';

import type {Facet, Options, Target} from '..';

export type RemoteAppTargetFacet = Facet;

const {
	PkgJson: {addDependencies},
} = TRANSFORM_OPERATIONS;
const {info, print} = format;

const TARGET_ID = 'target-remote-app';

const projectTypeFacets: {[name: string]: RemoteAppTargetFacet} = {
	'Plain JavaScript': facetPlainJs,
	'React': facetRemoteAppReact,
};
const platforms = dependencies[TARGET_ID]['platforms'];

const target: Target = {
	name: 'Liferay Remote App Project',

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

		options = await facetBuildable.prompt(true, options);
		options = await facetStartable.prompt(true, options);
		options = await projectTypeFacet.prompt(useDefaults, options);

		return options;
	},

	async render(options: Options): Promise<void> {
		await facetProject.render(options);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		await renderer.render('liferay.json', options);

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

		await facetBuildable.render(options);
		await facetStartable.render(options);
		await projectTypeFacet.render(options);
	},
};

export default target;
