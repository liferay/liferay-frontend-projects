import prop from 'dot-prop';

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
	 * Get the path to localization file.
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
