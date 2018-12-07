import prop from 'dot-prop';
import path from 'path';

import {DEFAULT_LOCALIZATION} from '../facet-localization/constants';
import {DEFAULT_SETTINGS} from '../facet-settings/constants';

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
	 * Test if the project has settings configuration.
	 * @return {boolean}
	 */
	get hasSettings() {
		const fs = this._generator.fs;

		return (
			prop.has(this._npmbundlerrc, 'create-jar.features.settings') ||
			fs.exists(DEFAULT_SETTINGS)
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
		} else {
			localization = `${DEFAULT_LOCALIZATION}.properties`;

			if (fs.exists(localization)) {
				return localization;
			}
		}

		return undefined;
	}

	/**
	 * Get the path to the settings configuration file.
	 * @return {string}
	 */
	get settingsFilePath() {
		const fs = this._generator.fs;

		let settings = prop.get(
			this._npmbundlerrc,
			'create-jar.features.settings'
		);

		if (settings) {
			return settings;
		} else {
			if (fs.exists(DEFAULT_SETTINGS)) {
				return DEFAULT_SETTINGS;
			}
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
