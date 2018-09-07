import path from 'path';
import Generator from 'yeoman-generator';

import dependenciesJson from './dependencies.json';
import {Copier, PkgJsonModifier, StylesCssModifier} from '../utils';

/**
 * Implementation of generation of Angular portlets.
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
		this.answers = {};
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		const cp = new Copier(this);
		const pkgJson = new PkgJsonModifier(this);
		const stylesCss = new StylesCssModifier(this);

		pkgJson.addDevDependency('ncp', '^2.0.0');
		pkgJson.addBuildStep('node ./scripts/copy-resources');
		cp.copyFile('scripts/copy-resources.js');

		pkgJson.addBuildStep('node ./scripts/replace-tokens');
		cp.copyFile('scripts/replace-tokens.js');

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('tsc');
		cp.copyFile('tsconfig.json');

		pkgJson.setMain('bootstrap.js');
		cp.copyDir('src');

		stylesCss.addRule('.tag', 'font-weight: bold;');
		stylesCss.addRule('.value', 'font-style: italic;');
	}
}
