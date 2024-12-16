/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import ConfigurationJsonModifier from '../utils/modifier/features/configuration.json';
import LanguagePropertiesModifier from '../utils/modifier/features/localization/Language.properties';

/**
 *
 */
export default class {

	/**
	 * @param {Generator} generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 *
	 */
	generate() {
		const projectAnalyzer = new ProjectAnalyzer(this._generator);

		if (projectAnalyzer.hasConfiguration) {
			const configurationJson = new ConfigurationJsonModifier(
				this._generator
			);

			if (projectAnalyzer.hasLocalization) {

				// Add system configuration description

				configurationJson.addField(
					ConfigurationJsonModifier.Section.SYSTEM,
					'fruit',
					'string',
					{
						name: 'fruit',
						description: 'fruit-help',
						required: false,
						defaultValue: 'orange',
						options: {
							orange: 'an-orange',
							pear: 'a-pear',
							apple: 'an-apple',
						},
					}
				);

				// Add portletInstance configuration description

				configurationJson.addField(
					ConfigurationJsonModifier.Section.PORTLET_INSTANCE,
					'drink',
					'string',
					{
						name: 'drink',
						description: 'drink-help',
						required: false,
						defaultValue: 'water',
						options: {
							water: 'water',
							wine: 'wine',
							beer: 'beer',
						},
					}
				);

				// Add configuration localization

				new LanguagePropertiesModifier(this._generator).addProperties({
					'fruit': 'Favorite fruit',
					'fruit-help': 'Choose the fruit you like the most',
					'an-orange': 'An orange',
					'a-pear': 'A pear',
					'an-apple': 'An apple',
					'drink': 'Favorite drink',
					'drink-help': 'Choose the drink you like the most',
					'water': 'Water',
					'wine': 'Wine',
					'beer': 'Beer',
				});
			}
			else {

				// Add system configuration description

				configurationJson.addField(
					ConfigurationJsonModifier.Section.SYSTEM,
					'fruit',
					'string',
					{
						name: 'Favorite fruit',
						description: 'Choose the fruit you like the most',
						required: false,
						defaultValue: 'orange',
						options: {
							orange: 'An orange',
							pear: 'A pear',
							apple: 'An apple',
						},
					}
				);

				// Add portletInstance configuration description

				configurationJson.addField(
					ConfigurationJsonModifier.Section.PORTLET_INSTANCE,
					'drink',
					'string',
					{
						name: 'Favorite drink',
						description: 'Choose the drink you like the most',
						required: false,
						defaultValue: 'water',
						options: {
							water: 'Water',
							wine: 'Wine',
							beer: 'Beer',
						},
					}
				);
			}
		}
	}
}
