/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import path from 'path';
import properties from 'properties';

const DEFAULT_LOCALE = 'default';

/**
 * Reflects localization configuration of JS Toolkit projects.
 */
export default class Localization {
	/**
	 *
	 * @param {Project} project
	 */
	constructor({_projectDir, _npmbundlerrc}) {
		this._projectDir = _projectDir;
		this._npmbundlerrc = _npmbundlerrc;

		this._cachedAvailableLocales = undefined;
		this._cachedLabels = {};
		this._cachedLanguageFileBaseName = undefined;
		this._cachedLocalizationFiles = undefined;

		this.DEFAULT_LOCALE = DEFAULT_LOCALE;
	}

	/**
	 * Get the array of available locales for the project
	 * @return {array|undefined}
	 */
	get availableLocales() {
		if (this._cachedAvailableLocales === undefined) {
			this._cachedAvailableLocales = Object.keys(
				this._localizationFiles
			).filter(locale => locale !== DEFAULT_LOCALE);
		}

		return this._cachedAvailableLocales;
	}

	/**
	 *
	 * @param {string} locale
	 * @return {object|undefined}
	 */
	getLabels(locale = DEFAULT_LOCALE) {
		if (this._cachedLabels[locale] === undefined) {
			const filePath = this._localizationFiles[locale];

			if (filePath) {
				this._cachedLabels[locale] = properties.parse(
					fs.readFileSync(filePath).toString()
				);
			} else {
				this._cachedLabels[locale] = {};
			}
		}

		return this._cachedLabels[locale];
	}

	/**
	 * Get the language file base name (absolute path plus name, without
	 * .properties extension)
	 * @return {object|undefined}
	 */
	get languageFileBaseName() {
		if (this._cachedLanguageFileBaseName === undefined) {
			const cfgValue = prop.get(
				this._npmbundlerrc,
				'create-jar.features.localization'
			);

			if (cfgValue !== undefined) {
				this._cachedLanguageFileBaseName = path.join(
					this._projectDir,
					cfgValue
				);
			} else {
				const defaultLanguageFilePath = path.join(
					this._projectDir,
					'features',
					'localization',
					'Language.properties'
				);

				if (fs.existsSync(defaultLanguageFilePath)) {
					this._cachedLanguageFileBaseName = defaultLanguageFilePath;
				}
			}
		}
		return this._cachedLanguageFileBaseName;
	}

	/**
	 * @return {boolean}
	 */
	get supported() {
		return this.languageFileBaseName !== undefined;
	}

	/**
	 * Get the locale of a .properties file based on its name
	 * @param {string} fileName
	 * @return {string}
	 */
	_getFileNameLocale(fileName) {
		const start = fileName.indexOf('_');

		if (start === -1) {
			return DEFAULT_LOCALE;
		}

		const end = fileName.lastIndexOf('.properties');

		return fileName.substring(start + 1, end);
	}

	/**
	 * Get the list of localization files' absolute path for the project indexed
	 * by locale abbreviation.
	 * @param {string} localization base localization file name
	 * @return {object}
	 */
	get _localizationFiles() {
		if (this._cachedLocalizationFiles === undefined) {
			const languageFileBaseName = this.languageFileBaseName;

			if (languageFileBaseName === undefined) {
				this._cachedLocalizationFiles = {};
			} else {
				const localizationDir = path.dirname(languageFileBaseName);

				const files = fs.readdirSync(localizationDir);

				this._cachedLocalizationFiles = files.reduce(
					(map, file) => (
						(map[this._getFileNameLocale(file)] = path.join(
							localizationDir,
							file
						)),
						map
					),
					{}
				);
			}
		}

		return this._cachedLocalizationFiles;
	}
}
