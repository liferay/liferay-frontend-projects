import ProjectAnalyzer from '../utils/ProjectAnalyzer';
import PreferencesJsonModifier from '../utils/modifier/features/preferences.json';
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

		if (projectAnalyzer.hasPreferences) {
			const preferencesJson = new PreferencesJsonModifier(
				this._generator
			);

			if (projectAnalyzer.hasLocalization) {
				// Add preferences description
				preferencesJson.addField('drink', 'string', {
					name: 'drink',
					description: 'drink-help',
					required: false,
					defaultValue: 'water',
					options: {
						water: 'water',
						wine: 'wine',
						beer: 'beer',
					},
				});

				// Add preferences localization
				new LanguagePropertiesModifier(this._generator).addProperties({
					'drink': 'Favourite drink',
					'drink-help': 'Choose the drink you like the most',
					'water': 'Water',
					'wine': 'Wine',
					'beer': 'Beer',
				});
			} else {
				// Add preferences description
				preferencesJson.addField('drink', 'string', {
					name: 'Favourite drink',
					description: 'Choose the drink you like the most',
					required: false,
					defaultValue: 'water',
					options: {
						water: 'Water',
						wine: 'Wine',
						beer: 'Beer',
					},
				});
			}
		}
	}
}
