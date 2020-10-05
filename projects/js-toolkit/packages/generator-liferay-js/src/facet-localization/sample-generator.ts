/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {hyphenate} from '../utils';
import ProjectAnalyzer from '../utils/ProjectAnalyzer';
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
	 * @param {object} labels a hash of key-value labels
	 */
	generate(labels): void {
		const projectAnalyzer = new ProjectAnalyzer(this._generator);

		if (projectAnalyzer.hasLocalization) {
			new LanguagePropertiesModifier(this._generator).addProperties(
				this._toProperties(labels)
			);
		}
	}

	/**
	 * Convert has of labels from key-value to properties format
	 * @param {object} labels
	 * @return {object}
	 */
	_toProperties(labels): object {
		return Object.keys(labels).reduce((obj, key) => {
			obj[hyphenate(key)] = labels[key];

			return obj;
		}, {});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _generator: any;
}
