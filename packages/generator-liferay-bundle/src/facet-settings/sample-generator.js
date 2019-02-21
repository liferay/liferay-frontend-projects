import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import SettingsJsonModifier from '../utils/modifier/features/settings.json';
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

		if (projectAnalyzer.hasSettings) {
			const settingsJson = new SettingsJsonModifier(this._generator);

			if (projectAnalyzer.hasLocalization) {
				// Add settings description
				settingsJson.addField('fruit', 'string', {
					name: 'fruit',
					description: 'fruit-help',
					required: false,
					defaultValue: 'orange',
					options: {
						orange: 'an-orange',
						pear: 'a-pear',
						apple: 'an-apple',
					},
				});

				// Add settings localization
				new LanguagePropertiesModifier(this._generator).addProperties({
					'fruit': 'Favourite fruit',
					'fruit-help': 'Choose the fruit you like the most',
					'an-orange': 'An orange',
					'a-pear': 'A pear',
					'an-apple': 'An apple',
				});
			} else {
				// Add settings description
				settingsJson.addField('fruit', 'string', {
					name: 'Favourite fruit',
					description: 'Choose the fruit you like the most',
					required: false,
					defaultValue: 'orange',
					options: {
						orange: 'An orange',
						pear: 'A pear',
						apple: 'An apple',
					},
				});
			}
		}
	}
}
