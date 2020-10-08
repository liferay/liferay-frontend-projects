/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import Generator from 'yeoman-generator';

import {Copier, promptWithConfig} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';
import NpmbundlerrcModifier from '../utils/modifier/npmbundlerrc';
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
					'\n' +
					'  💡 Needs Liferay DXP/Portal CE 7.1 with JS Portlet Extender 1.1.0 or\n' +
					'     Liferay DXP/Portal CE 7.2+.\n' +
					'\n',
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

module.exports = exports['default'];
