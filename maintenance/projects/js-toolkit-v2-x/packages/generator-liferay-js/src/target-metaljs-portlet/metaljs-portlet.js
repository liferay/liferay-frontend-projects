/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import * as standardTarget from '../utils/target/standard';
import dependenciesJson from './dependencies.json';
import importsJson from './imports.json';

/**
 * Implementation of generation of Metal.js portlets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this.namespace = 'target-metaljs-portlet';
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
		this.answers = await promptWithConfig(this, [
			{
				type: 'confirm',
				name: 'importMetaljs',
				message:
					'Do you want to import Metal.js packages from Liferay DXP/Portal CE?\n' +
					'\n' +
					'  💡 If you answer yes Metal.js packages will be directly imported from the\n' +
					'     ones included in Liferay DXP/Portal CE instead of bundling them along\n' +
					"     this project's dependencies.\n" +
					'  💡 Answer yes if you value more performance over isolation/control of your\n' +
					"     project's dependencies.\n" +
					'\n',

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
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);
		const projectAnalyzer = new ProjectAnalyzer(this);
		const {importMetaljs, sampleWanted} = this.answers;

		// Configure build

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('babel --source-maps -d build src');
		cp.copyFile('.babelrc');

		// Configure webpack

		pkgJson.addDevDependency('babel-loader', '7.1.5');
		npmbuildrc.addWebpackRule(/src\/.*\.js$/, 'babel-loader');

		// Configure metal imports

		if (importMetaljs) {
			npmbundlerrc.mergeImports(importsJson);
			npmbundlerrc.addExclusion('incremental-dom');
			npmbundlerrc.addExclusion('incremental-dom-string');
		}

		// Prepare text labels

		const labels = standardTarget.generateLabels(this);

		// Prepare context

		const context = standardTarget.generateContext(this, {
			labels: labels[projectAnalyzer.hasLocalization ? 'jsx' : 'raw'],
		});

		// Copy JavaScript files

		pkgJson.setMain('index.js');
		cp.copyFile('src/index.js', {context});

		// Generate sample contents

		standardTarget.generateSamples(this, labels);
		if (sampleWanted) {
			cp.copyDir('src', {context});
		}
	}
}

module.exports = exports['default'];
