/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	CustomElementBuildOptions,
	Project,
	format,
} from '@liferay/js-toolkit-core';

import promptForConfiguration from './util/promptForConfiguration';
import runConfigureWizard from './util/runConfigureWizard';

const {info, print} = format;

export default async function configureBuild(): Promise<void> {
	await runConfigureWizard('build', async () => {
		const project = new Project('.');

		switch (project.build.type) {
			case 'bundler2':
				await configureBundler2Build();
				break;

			case 'customElement':
				await configureCustomElementBuild(project);
				break;

			default:
				throw new Error(`Unknown build type: ${project.build.type}`);
		}
	});
}

async function configureBundler2Build(): Promise<void> {
	print(
		info`There's nothing that can be configured in Bundler 2 type projects.`
	);
}

async function configureCustomElementBuild(project: Project): Promise<void> {
	const options = project.build.options as CustomElementBuildOptions;

	const {htmlElementName} = await promptForConfiguration([
		{
			default: options.htmlElementName,
			message: 'What is the custom element HTML tag name?',
			name: 'htmlElementName',
			type: 'input',
		},
	]);

	if (htmlElementName !== undefined) {
		project.build.storeOption('htmlElementName', htmlElementName);
	}
}
