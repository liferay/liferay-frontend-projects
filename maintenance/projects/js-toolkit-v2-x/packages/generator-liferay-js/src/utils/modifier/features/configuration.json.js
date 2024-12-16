/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import JsonModifier from '../../JsonModifier';
import ProjectAnalyzer from '../../ProjectAnalyzer';

/**
 * A class to help modifying the configuration.json file.
 */
export default class ConfigurationJsonModifier extends JsonModifier {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, new ProjectAnalyzer(generator).configurationFilePath);
	}

	/**
	 * Add a field to the file
	 * @param {string} section one of the values in `ConfigurationJsonModifier.Section`
	 * @param {string} id
	 * @param {string} type
	 * @param {string} name
	 * @param {string} description
	 * @param {boolean} required
	 * @param {any} defaultValue
	 * @param {object} options a hash of option ids as keys and objects with a
	 * 			name field as values
	 */
	addField(
		section,
		id,
		type,
		{defaultValue, description, name, options, required}
	) {
		this.modifyJson((json) => {
			prop.set(json, `${section}.fields.${id}.type`, type);
			if (name) {
				prop.set(json, `${section}.fields.${id}.name`, name);
			}
			if (description) {
				prop.set(
					json,
					`${section}.fields.${id}.description`,
					description
				);
			}
			if (required) {
				prop.set(json, `${section}.fields.${id}.required`, required);
			}
			if (defaultValue) {
				prop.set(json, `${section}.fields.${id}.default`, defaultValue);
			}
			if (options) {
				prop.set(json, `${section}.fields.${id}.options`, options);
			}
		});
	}
}

ConfigurationJsonModifier.Section = {
	SYSTEM: 'system',
	PORTLET_INSTANCE: 'portletInstance',
};
