/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {PkgJson} from '@liferay/js-toolkit-core';
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
	get name(): string {
		return this._packageJson.name || '';
	}

	/**
	 * Get project description.
	 * @return {string}
	 */
	get description(): string {
		return this._packageJson.description || '';
	}

	/**
	 * Get project display name (description if present, otherwise the name).
	 * @return {string}
	 */
	get displayName(): string {
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
	get hasLocalization(): boolean {
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
	get hasConfiguration(): boolean {
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
	get localizationBundleName(): string {
		const bundleName = path.basename(this.localizationFilePath);
		const extname = path.extname(bundleName);

		return bundleName.replace(new RegExp(extname.replace('.', '\\.')), '');
	}

	/**
	 * Get the path to localization properties file.
	 * @return {string}
	 */
	get localizationFilePath(): string {
		const fs = this._generator.fs;

		let localization: string = prop.get(
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
	get configurationFilePath(): string {
		const fs = this._generator.fs;

		const configuration = prop.get(
			this._npmbundlerrc,
			'create-jar.features.configuration'
		) as string;

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
	get _npmbundlerrc(): object {
		return this._generator.fs.readJSON('.npmbundlerrc');
	}

	/**
	 * Get the parsed 'package.json' file
	 * @return {object}
	 */
	get _packageJson(): PkgJson {
		return this._generator.fs.readJSON('package.json');
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private _generator: any;
}
