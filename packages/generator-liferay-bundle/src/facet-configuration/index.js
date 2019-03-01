import path from 'path';
import Generator from 'yeoman-generator';

import {promptWithConfig} from '../utils';
import {Copier} from '../utils';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import {DEFAULT_CONFIGURATION} from './constants';

/**
 * Generator to add configuration support to projects.
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
		this.answers = await promptWithConfig(this, 'facet-configuration', [
			{
				type: 'confirm',
				name: 'useConfiguration',
				message:
					'Do you want to add configuration support?\n' +
					'  (👀 needs JS Portlet Extender 1.1.0)',
				default: true,
			},
		]);
	}

	/**
	 * Standard Yeoman generation function
	 */
	writing() {
		if (!this.answers.useConfiguration) {
			return;
		}

		const cp = new Copier(this);
		const npmbundlerrc = new NpmbundlerrcModifier(this);
		const projectAnalyzer = new ProjectAnalyzer(this);

		npmbundlerrc.setFeature('configuration', DEFAULT_CONFIGURATION);

		const context = {
			name: projectAnalyzer.name,
			description: projectAnalyzer.hasLocalization
				? projectAnalyzer.name
				: projectAnalyzer.displayName,
		};

		cp.copyDir('features', {context});

		// Add configuration name localization key
		if (projectAnalyzer.hasLocalization) {
			new LanguagePropertiesModifier(this).addProperty(
				context.name,
				projectAnalyzer.displayName
			);
		}
	}
}
