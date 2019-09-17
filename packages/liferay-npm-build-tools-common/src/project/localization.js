/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import properties from 'properties';

import FilePath from '../file-path';
import {getFeaturesFilePath} from './util';

const DEFAULT_LOCALE = 'default';

/**
 * Reflects localization configuration of JS Toolkit projects.
 */
export default class Localization {
	/**
	 *
	 * @param {Project} project
	 */
	constructor(project) {
		this._project = project;

		this._cachedAvailableLocales = undefined;
		this._cachedLabels = {};
		this._cachedLanguageFileBaseName = undefined;
		this._cachedLocalizationFileMap = undefined;

		this.DEFAULT_LOCALE = DEFAULT_LOCALE;
	}

	/**
	 * Get the array of available locales for the project
	 * @return {array|undefined}
	 */
	get availableLocales() {
		if (this._cachedAvailableLocales === undefined) {
			this._cachedAvailableLocales = Object.keys(
				this.localizationFileMap
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
			const file = this.localizationFileMap[locale];

			if (file) {
				this._cachedLabels[locale] = properties.parse(
					fs.readFileSync(file.asNative).toString()
				);
			} else {
				this._cachedLabels[locale] = {};
			}
		}

		return this._cachedLabels[locale];
	}

	/**
	 * Get the language file base name (absolute path plus name, without
	 * .properties extension in POSIX format)
	 * @return {FilePath|undefined}
	 */
	get languageFileBaseName() {
		if (this._cachedLanguageFileBaseName === undefined) {
			let absPath = getFeaturesFilePath(
				this._project,
				'create-jar.features.localization',
				'features/localization/Language.properties'
			);

			if (absPath !== undefined) {
				// Be lenient: remove trailing .properties if present
				if (absPath.endsWith('.properties')) {
					absPath = absPath.substring(0, absPath.length - 11);
				}

				this._cachedLanguageFileBaseName = new FilePath(absPath);
			}
		}

		return this._cachedLanguageFileBaseName;
	}

	/**
	 * Get the map of localization FilePaths indexed by locale abbreviation.
	 * @param {string} localization base localization file name
	 * @return {object}
	 */
	get localizationFileMap() {
		if (this._cachedLocalizationFileMap === undefined) {
			const languageFileBaseName = this.languageFileBaseName;

			if (languageFileBaseName === undefined) {
				this._cachedLocalizationFileMap = {};
			} else {
				const localizationDirPath = path.dirname(
					languageFileBaseName.asNative
				);

				const fileNames = fs.readdirSync(localizationDirPath);

				this._cachedLocalizationFileMap = fileNames.reduce(
					(map, fileName) => (
						(map[this._getFileNameLocale(fileName)] = new FilePath(
							path.join(localizationDirPath, fileName)
						)),
						map
					),
					{}
				);
			}
		}

		return this._cachedLocalizationFileMap;
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
}
