/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import properties from 'properties';

import FilePath from '../file-path';
import {Project} from '.';
import {getFeaturesFilePath} from './util';

/** StringsMaps indexed by locale */
export interface LocaleStringsMap {
	[index: string]: StringsMap;
}

/** Localized strings indexed by identifier */
export interface StringsMap {
	[index: string]: string;
}

/** FilePaths indexed by locale */
export interface LocaleFilePathMap {
	[index: string]: FilePath;
}

/**
 * Reflects localization configuration of JS Toolkit projects.
 */
export default class Localization {
	static readonly DEFAULT_LOCALE = 'default';

	constructor(project: Project) {
		this._project = project;

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

			this._languageFileBaseName = new FilePath(absPath);
			this._supported = true;
		}
	}

	/**
	 * Get the array of available locales for the project.
	 * @return an array or `undefined` if L10N is not supported
	 */
	get availableLocales(): string[] | undefined {
		if (!this.supported) {
			return undefined;
		}

		if (this._availableLocales === undefined) {
			this._availableLocales = Object.keys(
				this.localizationFileMap
			).filter(locale => locale !== Localization.DEFAULT_LOCALE);
		}

		return this._availableLocales;
	}

	/**
	 * Get the map of localized strings for a given locale.
	 * @return a map or `undefined` if L10N is not supported
	 */
	getLabels(locale = Localization.DEFAULT_LOCALE): StringsMap | undefined {
		if (!this.supported) {
			return undefined;
		}

		if (this._localeStringsMap[locale] === undefined) {
			const file = this.localizationFileMap[locale];

			if (file) {
				this._localeStringsMap[locale] = properties.parse(
					fs.readFileSync(file.asNative).toString()
				);
			} else {
				this._localeStringsMap[locale] = {};
			}
		}

		return this._localeStringsMap[locale];
	}

	/**
	 * Get the language file base name (absolute path plus name without
	 * `.properties` extension).
	 * @return a base file name or `undefined` if L10N is not supported
	 */
	get languageFileBaseName(): FilePath | undefined {
		if (!this.supported) {
			return undefined;
		}

		return this._languageFileBaseName;
	}

	/**
	 * Get the map of localization FilePaths indexed by locale abbreviation.
	 * @return a map or `undefined` if L10N is not supported
	 */
	get localizationFileMap(): LocaleFilePathMap | undefined {
		if (!this.supported) {
			return undefined;
		}

		if (this._localizationFileMap === undefined) {
			const localizationDirPath = path.dirname(
				this.languageFileBaseName.asNative
			);

			const fileNames = fs.readdirSync(localizationDirPath);

			this._localizationFileMap = fileNames.reduce(
				(map, fileName) => (
					(map[this._getFileNameLocale(fileName)] = new FilePath(
						path.join(localizationDirPath, fileName)
					)),
					map
				),
				{}
			);
		}

		return this._localizationFileMap;
	}

	get supported(): boolean {
		return this._supported;
	}

	/**
	 * Get the locale of a .properties file based on its name
	 */
	_getFileNameLocale(fileName: string): string {
		const start = fileName.indexOf('_');

		if (start === -1) {
			return Localization.DEFAULT_LOCALE;
		}

		const end = fileName.lastIndexOf('.properties');

		return fileName.substring(start + 1, end);
	}

	private readonly _project: Project;
	private readonly _supported: boolean = false;
	private _availableLocales: string[];
	private _localeStringsMap: LocaleStringsMap = {};
	private _languageFileBaseName: FilePath;
	private _localizationFileMap: LocaleFilePathMap;
}
