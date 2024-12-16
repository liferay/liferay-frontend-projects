/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import * as standardTarget from '../utils/target/standard';

/**
 * Implementation of generation of plain JavaScript portlets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this.namespace = 'target-vanilla-portlet';
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await promptWithConfig(this, [
			{
				type: 'confirm',
				name: 'useBabel',
				message:
					'Do you want to use Babel to transpile JavaScript sources?',
				default: true,
			},
		]);

		await standardTarget.prompting(this);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);
		const npmbuildrc = new NpmbuildrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);
		const projectAnalyzer = new ProjectAnalyzer(this);
		const {useBabel} = this.answers;

		// Configure build

		if (useBabel) {
			pkgJson.addDevDependency('@babel/cli', '^7.7.5');
			pkgJson.addDevDependency('@babel/core', '^7.7.5');
			pkgJson.addDevDependency('@babel/preset-env', '^7.7.6');
			pkgJson.addBuildStep('babel --source-maps -d build src');
			cp.copyFile('.babelrc');
		}
		else {
			pkgJson.addBuildStep('npm run copy-sources');
			pkgJson.addScript('copy-sources', 'lnbs-copy-sources');
		}

		// Configure webpack

		if (useBabel) {
			npmbuildrc.addWebpackRule(/src\/.*\.js$/, 'babel-loader');
		}

		// Prepare text labels

		const labels = standardTarget.generateLabels(this);

		// Prepare context

		const context = standardTarget.generateContext(this, {
			labels:
				labels[
					projectAnalyzer.hasLocalization
						? useBabel
							? 'template'
							: 'js'
						: useBabel
						? 'raw'
						: 'quoted'
				],
		});

		// Copy JavaScript files

		pkgJson.setMain('index.js');
		cp.copyFile(`src/index.${useBabel ? 'babel' : 'nobabel'}.js`, {
			context,
			dest: 'src/index.js',
		});

		// Generate sample contents

		standardTarget.generateSamples(this, labels);
	}
}

module.exports = exports['default'];
