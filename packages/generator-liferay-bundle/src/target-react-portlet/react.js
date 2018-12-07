import path from 'path';
import Generator from 'yeoman-generator';

import LocalizationSampleGenerator from '../facet-localization/sample-generator';
import SettingsSampleGenerator from '../facet-settings/sample-generator';
import {Copier, formatLabels, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import NpmbuildrcModifier from '../utils/modifier/npmbuildrc';
import PkgJsonModifier from '../utils/modifier/package.json';
import StylesCssModifier from '../utils/modifier/assets/css/styles.css';
import dependenciesJson from './dependencies.json';

/**
 * Implementation of generation of React portlets.
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
		this.answers = await promptWithConfig(this, 'target-react-portlet', [
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
		const {sampleWanted} = this.answers;

		// Configure build
		pkgJson.mergeDependencies(dependenciesJson);
		pkgJson.addBuildStep('babel --source-maps -d build src');
		cp.copyFile('.babelrc');

		// Configure webpack
		pkgJson.addDevDependency('babel-loader', '^7.0.0');
		npmbuildrc.addWebpackRule(/src\/.*\.js$/, 'babel-loader');

		// Prepare text labels
		const labels = formatLabels({
			porletNamespace: 'Porlet Namespace',
			contextPath: 'Context Path',
			portletElementId: 'Portlet Element Id',
			configuration: projectAnalyzer.hasSettings
				? 'Configuration'
				: undefined,
		});

		// Prepare configuration display
		const signature =
			'portletNamespace, contextPath, portletElementId' +
			(projectAnalyzer.hasSettings ? ', configuration' : '');

		// Prepare context
		const context = {
			hasConfiguration: projectAnalyzer.hasSettings,
			labels: labels[projectAnalyzer.hasLocalization ? 'jsx' : 'raw'],
			signature,
		};

		// Copy javascript files
		pkgJson.setMain('index.js');
		cp.copyFile('src/index.js', {context});

		// Generate sample contents
		if (sampleWanted) {
			// Add styles
			stylesCss.addRule('.tag', 'font-weight: bold;');
			stylesCss.addRule('.value', 'font-style: italic;');

			// Copy sample Javascript files
			cp.copyDir('src', {context});

			// Add localization keys
			new LocalizationSampleGenerator(this).generate(labels.raw);

			// Add sample settings
			new SettingsSampleGenerator(this).generate();
		}
	}
}
