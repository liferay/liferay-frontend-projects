import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import PkgJsonModifier from '../utils/modifier/package.json';
import StylesCssModifier from '../utils/modifier/assets/css/styles.css';
import WebpackRulesJsonModifier from '../utils/modifier/scripts/start/webpack.rules.json';

/**
 * Implementation of generation of plain Javascript portlets.
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
		this.answers = await promptWithConfig(this, 'target-vanilla-portlet', [
			{
				type: 'confirm',
				name: 'useBabel',
				message:
					'Do you want to use Babel to transpile Javascript sources?',
				default: true,
			},
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
		const {useBabel, sampleWanted} = this.answers;

		if (useBabel) {
			pkgJson.addDevDependency('babel-cli', '^6.26.0');
			pkgJson.addDevDependency('babel-preset-env', '^1.7.0');
			pkgJson.addBuildStep('babel --source-maps -d build src');
			cp.copyFile('.babelrc');
		} else {
			pkgJson.addDevDependency('ncp', '^2.0.0');
			pkgJson.addBuildStep('node ./scripts/build');
			cp.copyFile('scripts/build.js');
		}

		pkgJson.setMain('index.js');
		if (useBabel) {
			cp.copyFile('src/index.babel.js', {dest: 'src/index.js'});

			pkgJson.addDevDependency('babel-loader', '^7.0.0');
			webpackRulesJson.addRule(/src\/.*\.js$/, 'babel-loader');
		} else {
			cp.copyFile('src/index.nobabel.js', {dest: 'src/index.js'});
		}

		if (sampleWanted) {
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');
		}
	}
}
