/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import pkgJson from '../../package.json';
import * as cfg from '../config';
import {promptWithConfig} from '../utils';
import {Copier, toHumanReadable} from '../utils';

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

		const {
			liferayNpmBuildSupportVersion,
			liferayNpmBundlerVersion,
		} = this._getVersions();

		const context = {
			name: path.basename(process.cwd()),
			liferayNpmBundlerVersion,
			liferayNpmBuildSupportVersion,
		};

		cp.copyFile('README.md', {context});
		cp.copyFile('package.json', {context});
		cp.copyFile('.gitignore');
		cp.copyFile('.npmbuildrc');
		cp.copyFile('.npmbundlerrc', {context});
		cp.copyFile('.npmignore');
		cp.copyDir('assets');
	}

	/**
	 * Get dev dependencies version numbers.
	 * @return {object}
	 */
	_getVersions() {
		let liferayNpmBundlerVersion = `^${pkgJson.version}`;
		let liferayNpmBuildSupportVersion = `^${pkgJson.version}`;

		const sdkVersion = cfg.getSDKVersion();

		if (sdkVersion) {
			if (Number.isNaN(parseInt(sdkVersion.charAt(0)))) {
				liferayNpmBundlerVersion =
					sdkVersion + '/packages/liferay-npm-bundler';
				liferayNpmBuildSupportVersion =
					sdkVersion + '/packages/liferay-npm-build-support';
			} else {
				liferayNpmBundlerVersion = sdkVersion;
				liferayNpmBuildSupportVersion = sdkVersion;
			}
		}

		return {liferayNpmBundlerVersion, liferayNpmBuildSupportVersion};
	}
}
