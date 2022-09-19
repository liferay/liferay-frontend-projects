/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, Project} from '@liferay/js-toolkit-core';
import fs from 'fs';

import promptForConfiguration from './util/promptForConfiguration';
import runConfigureWizard from './util/runConfigureWizard';

export default async function configureDeploy(): Promise<void> {
	await runConfigureWizard('deploy', async () => {
		const project = new Project('.');

		const {dir} = await promptForConfiguration([
			{
				default: project.deploy.dir?.asPosix.replace(
					/\/osgi\/modules$/,
					''
				),
				message: 'What is the path to your local Liferay installation?',
				name: 'dir',
				type: 'input',
				validate: (dir): string | true => {
					const deployDir = new FilePath(dir as string)
						.join('osgi', 'modules')
						.resolve();

					if (!fs.existsSync(deployDir.asNative)) {
						return `Invalid answer: ${deployDir.asNative} does not exist`;
					}

					return true;
				},
			},
		]);

		if (dir !== undefined) {
			project.deploy.storeDir(
				new FilePath(dir as string).join('osgi', 'modules')
			);
		}
	});
}
