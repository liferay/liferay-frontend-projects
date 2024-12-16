/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import JsonModifier from '../JsonModifier';

/**
 * A class to help modifying the .npmbundlerrc file.
 */
export default class extends JsonModifier {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, '.npmbundlerrc');
	}

	/**
	 * Add an exclusion to the .npmbundlerrc file.
	 * @param {string} name name of package
	 * @param {boolean} value true to exclude package
	 */
	addExclusion(name, value = true) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `exclude.${name}`, value);
		});
	}

	/**
	 * Merge all imports contained in a JSON object into the .npmbundlerrc file.
	 * @param {Object} imports an object containing the config.imports section
	 */
	mergeImports(imports) {
		this.modifyJson((json) => {
			Object.entries(imports).forEach(([provider, dependencies]) => {
				provider = this._escapeProp(provider);

				Object.entries(dependencies).forEach(([name, semver]) => {
					name = this._escapeProp(name);

					prop.set(
						json,
						`config.imports.${provider}.${name}`,
						semver
					);
				});
			});
		});
	}

	/**
	 * Set a feature value.
	 * @param {string} name name of feature
	 * @param {any} value value of feature
	 */
	setFeature(name, value) {
		name = this._escapeProp(name);

		this.modifyJson((json) => {
			prop.set(json, `create-jar.features.${name}`, value);
		});
	}

	/**
	 * Set preset package name.
	 * @param {string} presetName
	 */
	setPreset(presetName) {
		this.modifyJson((json) => {
			prop.set(json, 'preset', presetName);
		});
	}
}
