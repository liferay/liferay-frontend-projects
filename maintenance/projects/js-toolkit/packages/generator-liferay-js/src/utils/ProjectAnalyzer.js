/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import path from 'path';

import {DEFAULT_CONFIGURATION} from '../facet-configuration/constants';
import {DEFAULT_LOCALIZATION} from '../facet-localization/constants';

/**
 * A class to be able to analyze what the project does and doesn't.
 */
export default class ProjectAnalyzer {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Get project name.
	 * @return {string}
	 */
	get name() {
		return this._packageJson.name || '';
	}

	/**
	 * Get project description.
	 * @return {string}
	 */
	get description() {
		return this._packageJson.description || '';
	}

	/**
	 * Get project display name (description if present, otherwise the name).
	 * @return {string}
	 */
	get displayName() {
		let displayName = this.description;

		if (displayName === '') {
			displayName = this.name;
		}

		return displayName;
	}

	/**
	 * Test if the project has localization enabled.
	 * @return {boolean}
	 */
	get hasLocalization() {
		const fs = this._generator.fs;

		return (
			prop.has(this._npmbundlerrc, 'create-jar.features.localization') ||
			fs.exists(`${DEFAULT_LOCALIZATION}.properties`)
		);
	}

	/**
	 * Test if the project has configuration.
	 * @return {boolean}
	 */
	get hasConfiguration() {
		const fs = this._generator.fs;

		return (
			prop.has(this._npmbundlerrc, 'create-jar.features.configuration') ||
			fs.exists(DEFAULT_CONFIGURATION)
		);
	}

	/**
	 * Get the basename of the localization file (without the .properties
	 * extension)
	 * @return {string}
	 */
	get localizationBundleName() {
		const bundleName = path.basename(this.localizationFilePath);

		const extname = path.extname(bundleName);

		return bundleName.replace(new RegExp(extname.replace('.', '\\.')), '');
	}

	/**
	 * Get the path to localization properties file.
	 * @return {string}
	 */
	get localizationFilePath() {
		const fs = this._generator.fs;

		let localization = prop.get(
			this._npmbundlerrc,
			'create-jar.features.localization'
		);

		if (localization) {
			return `${localization}.properties`;
		}
		else {
			localization = `${DEFAULT_LOCALIZATION}.properties`;

			if (fs.exists(localization)) {
				return localization;
			}
		}

		return undefined;
	}

	/**
	 * Get the path to the configuration file.
	 * @return {string}
	 */
	get configurationFilePath() {
		const fs = this._generator.fs;

		const configuration = prop.get(
			this._npmbundlerrc,
			'create-jar.features.configuration'
		);

		if (configuration) {
			return configuration;
		}
		else if (fs.exists(DEFAULT_CONFIGURATION)) {
			return DEFAULT_CONFIGURATION;
		}

		return undefined;
	}

	/**
	 * Get the parsed '.npmbundlerrc' file
	 * @return {object}
	 */
	get _npmbundlerrc() {
		return this._generator.fs.readJSON('.npmbundlerrc');
	}

	/**
	 * Get the parsed 'package.json' file
	 * @return {object}
	 */
	get _packageJson() {
		return this._generator.fs.readJSON('package.json');
	}
}
