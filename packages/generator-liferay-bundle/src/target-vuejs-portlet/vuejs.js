import path from 'path';
import Generator from 'yeoman-generator';

import * as cfg from '../config';
import dependenciesJson from './dependencies.json';
import {Copier, PkgJsonModifier, StylesCssModifier} from '../utils';

/**
 * Implementation of generation of Vue.js portlets.
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
		this.answers = await this.prompt([
			{
				type: 'confirm',
				name: 'sampleWanted',
				message: 'Do you want to generate sample code?',
				default: cfg.getDefaultAnswer(
					'target-vuejs-portlet',
					'sampleWanted',
					false
				),
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);
		const pkgJson = new PkgJsonModifier(this);
		const stylesCss = new StylesCssModifier(this);
		const {sampleWanted} = this.answers;

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('babel --source-maps -D -d build src');
		cp.copyFile('.babelrc');

		pkgJson.setMain('index.js');
		cp.copyDir('src');

		if (sampleWanted) {
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');
		}
	}
}
