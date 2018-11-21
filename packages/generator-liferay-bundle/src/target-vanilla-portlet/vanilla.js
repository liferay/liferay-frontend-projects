import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, formatLabels, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import StylesCssModifier from '../utils/modifier/assets/css/styles.css';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';

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
		const npmbuildrc = new NpmbuildrcModifier(this);
		const pkgJson = new PkgJsonModifier(this);
		const stylesCss = new StylesCssModifier(this);
		const projectAnalyzer = new ProjectAnalyzer(this);
		const {useBabel, sampleWanted} = this.answers;

		// Configure build
		if (useBabel) {
			pkgJson.addDevDependency('babel-cli', '^6.26.0');
			pkgJson.addDevDependency('babel-preset-env', '^1.7.0');
			pkgJson.addBuildStep('babel --source-maps -d build src');
			cp.copyFile('.babelrc');
		} else {
			pkgJson.addBuildStep('npm run copy-sources');
			pkgJson.addScript('copy-sources', 'lnbs-copy-sources');
		}

		// Configure webpack
		if (useBabel) {
			pkgJson.addDevDependency('babel-loader', '^7.0.0');
			npmbuildrc.addWebpackRule(/src\/.*\.js$/, 'babel-loader');
		}

		// Prepare text labels
		const labels = formatLabels({
			porletNamespace: 'Porlet Namespace',
			contextPath: 'Context Path',
			portletElementId: 'Portlet Element Id',
		});

		// Copy Javascript files
		pkgJson.setMain('index.js');
		cp.copyFile(`src/index.${useBabel ? 'babel' : 'nobabel'}.js`, {
			context: {
				labels:
					labels[
						projectAnalyzer.hasLocalization
							? useBabel ? 'template' : 'js'
							: useBabel ? 'raw' : 'quoted'
					],
			},
			dest: 'src/index.js',
		});

		// Generate sample contents
		if (sampleWanted) {
			// Add styles
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');

			// Add localization keys
			if (projectAnalyzer.hasLocalization) {
				new LanguagePropertiesModifier(this).addProperties(labels.raw);
			}
		}
	}
}
