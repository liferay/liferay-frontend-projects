import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import dependenciesJson from './dependencies.json';
import {Copier} from '../utils';
import PkgJsonModifier from '../utils/modifier/package.json';
import StylesCssModifier from '../utils/modifier/assets/css/styles.css';
import IndexJsModifier from '../utils/modifier/scripts/start/index.js';
import WebpackExtensionsJsonModifier from '../utils/modifier/scripts/start/webpack.extensions.json';
import WebpackRulesJsonModifier from '../utils/modifier/scripts/start/webpack.rules.json';

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
		this.answers = await promptWithConfig(this, 'target-angular-portlet', [
			{
				type: 'confirm',
				name: 'sampleWanted',
				message: 'Do you want to generate sample code?',
				default: false,
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
		const webpackRulesJson = new WebpackRulesJsonModifier(this);
		const webpackExtensionsJson = new WebpackExtensionsJsonModifier(this);
		const indexJs = new IndexJsModifier(this);

		const {sampleWanted} = this.answers;

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('tsc');
		cp.copyFile('tsconfig.json');

		pkgJson.setMain('index.js');
		cp.copyFile('src/polyfills.ts');
		cp.copyFile('src/index.ts');
		cp.copyDir('src/types');

		pkgJson.addDevDependency('ts-loader', '^5.0.0');
		webpackRulesJson.addRule(/src\/.*\.ts$/, 'ts-loader');
		webpackExtensionsJson.addExtensions('.ts', '.js');
		indexJs.setMainModule('index.ts');

		if (sampleWanted) {
			cp.copyDir('src', {context: {pkgJson: pkgJson.json}});
			cp.copyDir('assets');
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');
		}
	}
}
