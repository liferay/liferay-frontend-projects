/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {
	Copier,
	getSDKVersion,
	promptWithConfig,
	toHumanReadable,
} from '../utils';

/**
 * Generator to add base scaffolding to projects.
 */
export default class extends Generator {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	answers: any;

	/**
	 * Standard Yeoman initialization function
	 */
	initializing(): void {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting(): Promise<void> {
		this.answers = await promptWithConfig(this, 'facet-project', [
			{
				default: toHumanReadable(path.basename(process.cwd())),
				message:
					'What is the human readable description of your project?',
				name: 'description',
				type: 'input',
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing(): void {
		const cp = new Copier(this);

		const context = {
			liferayNpmBuildSupportVersion: getSDKVersion('liferay-npm-bundler'),
			liferayNpmBundlerVersion: getSDKVersion(
				'liferay-npm-build-support'
			),
			name: path.basename(process.cwd()),
		};

		cp.copyFile('README.md', {context});
		cp.copyFile('package.json', {context});
		cp.copyFile('.gitignore');
		cp.copyFile('.npmbuildrc');
		cp.copyFile('.npmbundlerrc', {context});
		cp.copyFile('.npmignore');
		cp.copyDir('assets');
	}
}

module.exports = exports['default'];
