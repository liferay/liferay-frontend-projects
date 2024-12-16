/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import * as standardTarget from '../utils/target/standard';
import dependenciesJson from './dependencies.json';

/**
 * Implementation of generation of Vue.js portlets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this.namespace = 'target-vuejs-portlet';
	}

	/**
	 * Standard Yeoman prompt function
	 */
	async prompting() {
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

		// Configure build

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('babel --source-maps -d build src');
		cp.copyFile('.babelrc');

		// Configure webpack

		pkgJson.addDevDependency('babel-loader', '7.1.5');
		npmbuildrc.addWebpackRule(/src\/.*\.js$/, 'babel-loader');

		// Prepare text labels

		const labels = standardTarget.generateLabels(this);

		// Prepare context

		const context = standardTarget.generateContext(this, {
			labels:
				labels[projectAnalyzer.hasLocalization ? 'template' : 'raw'],
		});

		// Copy javascript files

		pkgJson.setMain('index.js');
		cp.copyDir('src', {context});

		// Generate sample contents

		standardTarget.generateSamples(this, labels);
	}
}

module.exports = exports['default'];
