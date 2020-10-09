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
 * Implementation of generation of Angular portlets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.sourceRoot(path.join(__dirname, 'templates'));
		this.namespace = 'target-angular-portlet';
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
		const {sampleWanted} = this.answers;

		// Configure build

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('tsc');
		cp.copyFile('tsconfig.json');

		// Configure webpack

		pkgJson.addDevDependency('ts-loader', '5.3.3');
		npmbuildrc.addWebpackRule(/src\/.*\.ts$/, 'ts-loader');
		npmbuildrc.addWebpackExtensions('.ts', '.js');
		npmbuildrc.setWebpackMainModule('index.ts');

		// Prepare text labels

		const labels = standardTarget.generateLabels(this);

		// Prepare context

		const context = standardTarget.generateContext(this, {
			labels: labels[projectAnalyzer.hasLocalization ? 'js' : 'quoted'],
			pkgJson: pkgJson.json,
		});

		// Copy source files

		pkgJson.setMain('index.js');
		cp.copyFile('src/polyfills.ts', {context});
		cp.copyFile('src/index.ts', {context});
		cp.copyDir('src/types', {context});

		// Generate sample contents

		standardTarget.generateSamples(this, labels);
		if (sampleWanted) {
			cp.copyDir('src', {context});
			cp.copyDir('assets', {context});
		}
	}
}

module.exports = exports['default'];
