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
import facetDeployable from '../facet-deployable';
import facetProject from '../facet-project';
import facetStartable from '../facet-startable';

import type {Facet, Options, Target} from '..';

export type RemoteAppTargetFacet = Facet;

const {
	PkgJson: {addDependencies, setMain},
} = TRANSFORM_OPERATIONS;
const {info, print, success, text} = format;

const TARGET_ID = 'target-fds-cell-renderer';

const platforms = dependencies[TARGET_ID]['platforms'];

const target: Target = {
	dxpSupport: 'experimental',
	name: 'Liferay Frontend Data Set Cell Renderer',

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
				default: true,
				message: 'Do you want to use React to render your cell?',
				name: 'useReact',
				type: 'confirm',
			},
		]);

		options = await facetBuildable.prompt(true, options);
		options = await facetDeployable.prompt(true, options);
		options = await facetStartable.prompt(true, options);

		return options;
	},

	async render(options: Options): Promise<void> {
		await facetProject.render(options);

		const renderer = new TemplateRenderer(
			new FilePath(__dirname).join('templates'),
			options.outputPath
		);

		print(info`  Creating cell renderer`);

		await renderer.render('liferay.json', options);
		await renderer.render('tsconfig.json', options);
		if (options.useReact) {
			await renderer.render('src/index.tsx', options);
		}
		else {
			await renderer.render('src/index.ts', options);
		}

		print(info`Configuring target platform...`);

		const platform = `@liferay/${options.platform}`;

		print(info`  Adding {${platform}} as a dependency`);

		const pkgJsonFile = ensureOutputFile(options, 'package.json');

		await transformJsonFile(
			pkgJsonFile,
			pkgJsonFile,
			addDependencies({
				[platform]: '*',
			}),
			setMain(`./src/index.ts${options.useReact ? 'x' : ''}`)
		);

		await facetBuildable.render(options);
		await facetDeployable.render(options);
		await facetStartable.render(options);

		const {name} = options;

		print(
			'',
			success`{Project has been generated successfully!}`,
			'',
			text`
You can now run the following commands to build your project:

    $ {cd ${name}| ↩|}
    $ {npm install| ↩|} 
    $ {npm run start| ↩|} 

This will start a live development server that you can use to register and test
your Remote App with Liferay DXP.

Once you are finished with the development you can run:

    $ {npm run build| ↩|}

That will create a {build} directory inside the project with all the contents
needed to deploy your Remote App to your production servers.
`
		);
	},
};

export default target;
