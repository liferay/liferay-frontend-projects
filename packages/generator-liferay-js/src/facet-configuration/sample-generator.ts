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
	generate(): void {
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
						defaultValue: 'orange',
						description: 'fruit-help',
						name: 'fruit',
						options: {
							apple: 'an-apple',
							orange: 'an-orange',
							pear: 'a-pear',
						},
						required: false,
					}
				);

				// Add portletInstance configuration description
				configurationJson.addField(
					ConfigurationJsonModifier.Section.PORTLET_INSTANCE,
					'drink',
					'string',
					{
						defaultValue: 'water',
						description: 'drink-help',
						name: 'drink',
						options: {
							beer: 'beer',
							water: 'water',
							wine: 'wine',
						},
						required: false,
					}
				);

				// Add configuration localization
				new LanguagePropertiesModifier(this._generator).addProperties({
					'a-pear': 'A pear',
					'an-apple': 'An apple',
					'an-orange': 'An orange',
					beer: 'Beer',
					drink: 'Favorite drink',
					'drink-help': 'Choose the drink you like the most',
					fruit: 'Favorite fruit',
					'fruit-help': 'Choose the fruit you like the most',
					water: 'Water',
					wine: 'Wine',
				});
			} else {
				// Add system configuration description
				configurationJson.addField(
					ConfigurationJsonModifier.Section.SYSTEM,
					'fruit',
					'string',
					{
						defaultValue: 'orange',
						description: 'Choose the fruit you like the most',
						name: 'Favorite fruit',
						options: {
							apple: 'An apple',
							orange: 'An orange',
							pear: 'A pear',
						},
						required: false,
					}
				);

				// Add portletInstance configuration description
				configurationJson.addField(
					ConfigurationJsonModifier.Section.PORTLET_INSTANCE,
					'drink',
					'string',
					{
						defaultValue: 'water',
						description: 'Choose the drink you like the most',
						name: 'Favorite drink',
						options: {
							beer: 'Beer',
							water: 'Water',
							wine: 'Wine',
						},
						required: false,
					}
				);
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _generator: any;
}
