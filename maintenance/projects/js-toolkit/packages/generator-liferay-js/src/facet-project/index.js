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

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await promptWithConfig(this, 'facet-project', [
			{
				type: 'input',
				name: 'description',
				message:
					'What is the human readable description of your project?',
				default: toHumanReadable(path.basename(process.cwd())),
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);

		const context = {
			name: path.basename(process.cwd()),
			liferayNpmBundlerVersion: getSDKVersion(
				'liferay-npm-build-support'
			),
			liferayNpmBuildSupportVersion: getSDKVersion('liferay-npm-bundler'),
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
