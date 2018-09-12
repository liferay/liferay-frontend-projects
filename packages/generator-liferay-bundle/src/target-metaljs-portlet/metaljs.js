import path from 'path';
import Generator from 'yeoman-generator';

import * as cfg from '../config';
import dependenciesJson from './dependencies.json';
import importsJson from './imports.json';
import {
	Copier,
	NpmbundlerrcModifier,
	PkgJsonModifier,
	StylesCssModifier,
	ScriptsStartWebpackRulesJsonModifier,
} from '../utils';

/**
 * Implementation of generation of Metal.js portlets.
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
				name: 'importMetaljs',
				message:
					'Do you want to import Metal.js packages from Liferay?',
				default: cfg.getDefaultAnswer(
					'target-metaljs-portlet',
					'importMetaljs',
					true
				),
			},
			{
				type: 'confirm',
				name: 'sampleWanted',
				message: 'Do you want to generate sample code?',
				default: cfg.getDefaultAnswer(
					'target-metaljs-portlet',
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
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);
		const stylesCss = new StylesCssModifier(this);
		const webpackRulesJson = new ScriptsStartWebpackRulesJsonModifier(this);
		const {importMetaljs, sampleWanted} = this.answers;

		if (importMetaljs) {
			npmbundlerrc.mergeImports(importsJson);
			npmbundlerrc.addExclusion('incremental-dom');
			npmbundlerrc.addExclusion('incremental-dom-string');
		}

		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('babel --source-maps -D -d build src');
		cp.copyFile('.babelrc');

		pkgJson.setMain('index.js');
		cp.copyFile('src/index.js');

		pkgJson.addDevDependency('babel-loader', '^7.0.0');
		webpackRulesJson.addRule(/src\/.*\.js$/, 'babel-loader');

		if (sampleWanted) {
			cp.copyDir('src');
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');
		}
	}
}
