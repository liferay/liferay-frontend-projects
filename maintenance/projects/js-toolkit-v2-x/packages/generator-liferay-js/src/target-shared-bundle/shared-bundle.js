/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, promptWithConfig} from '../utils';
import PkgJsonModifier from '../utils/modifier/package.json';

/**
 * Implementation of generation of shared bundles.
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
		this.answers = await promptWithConfig(this, 'target-shared-bundle', [
			{
				type: 'confirm',
				name: 'createInitializer',
				message:
					'Does your shared bundle need an initializer?\n' +
					'\n' +
					'  💡 This is usually needed in frameworks which need a single point of\n' +
					'     initialization.\n' +
					'  💡 It may also be useful if you need to load any polyfill that must be\n' +
					'     loaded just once.\n' +
					'\n',
				default: false,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.createInitializer) {
			return;
		}

		const cp = new Copier(this);
		const pkgJson = new PkgJsonModifier(this);

		// Configure build

		pkgJson.addDevDependency('@babel/cli', '^7.7.5');
		pkgJson.addDevDependency('@babel/core', '^7.7.5');
		pkgJson.addDevDependency('@babel/preset-env', '^7.7.6');
		pkgJson.addBuildStep('babel --source-maps -d build src');
		cp.copyFile('.babelrc');

		// Copy JavaScript files

		pkgJson.setMain('index.js');
		cp.copyFile('src/index.js', {
			context: {
				pkgJson: JSON.parse(this.fs.read('package.json')),
			},
		});
	}
}

module.exports = exports['default'];
