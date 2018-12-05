import prop from 'dot-prop';

import {JsonModifier} from '../..';
import ProjectAnalyzer from '../../ProjectAnalyzer';

/**
 * A class to help modifying the settings.json file.
 */
export default class extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, new ProjectAnalyzer(generator).settingsFilePath);
	}

	/**
	 * Add a field to configuration
	 * @param {string} id
	 * @param {string} type
	 * @param {string} name
	 * @param {string} description
	 * @param {boolean} required
	 * @param {any} defaultValue
	 * @param {object} options a hash of option ids as keys and objects with a
	 * 			name field as values
	 */
	addField(id, type, {name, description, required, defaultValue, options}) {
		this.modifyJson(json => {
			prop.set(json, `fields.${id}.type`, type);
			if (name) {
				prop.set(json, `fields.${id}.name`, name);
			}
			if (description) {
				prop.set(json, `fields.${id}.description`, description);
			}
			if (required) {
				prop.set(json, `fields.${id}.required`, required);
			}
			if (defaultValue) {
				prop.set(json, `fields.${id}.default`, defaultValue);
			}
			if (options) {
				prop.set(json, `fields.${id}.options`, options);
			}
		});
	}
}
