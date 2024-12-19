/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import os from 'os';

import JsonModifier from '../JsonModifier';

/**
 * A class to help modifying the .npmbuildrc file.
 */
export default class extends JsonModifier {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, '.npmbuildrc');
	}

	/**
	 * Set local Liferay installation directory
	 * @param {string} liferayDir
	 */
	setLiferayDir(liferayDir) {
		this.modifyJson((json) => {
			prop.set(json, 'liferayDir', liferayDir);
		});
	}

	/**
	 * Set supported locales array
	 * @param {Array<string>} supportedLocales
	 */
	setSupportedLocales(supportedLocales) {
		this.modifyJson((json) => {
			prop.set(json, 'supportedLocales', supportedLocales);
		});
	}

	/**
	 * Set Microsoft Translator credentials
	 * @param {string} key
	 */
	setTranslatorTextKey(translatorTextKey) {
		this.modifyJson((json) => {
			prop.set(json, 'translatorTextKey', translatorTextKey);
		});
	}

	/**
	 * Set webpack's main module.
	 * @param {string} mainModule
	 */
	setWebpackMainModule(mainModule) {
		this.modifyJson((json) => {
			prop.set(json, 'webpack.mainModule', mainModule);
		});
	}

	/**
	 * Add a webpack rule to the .npmbuildrc file.
	 * @param {RegExp} regex a regex expression to match files
	 * @param {string} loader the name of a webpack loader
	 * @param {boolean} fixPathSepsInWindows wether to replace / path separators
	 * 						by \ when running on Windows
	 */
	addWebpackRule(regex, loader, fixPathSepsInWindows = true) {
		if (fixPathSepsInWindows && os.platform() === 'win32') {
			regex = new RegExp(regex.source.replace('/', '\\'), regex.flags);
		}

		this.modifyJson((json) => {
			let test = regex.toString();

			test = test.substring(1, test.length - 1);

			const currentRules = prop.get(json, 'webpack.rules', []);

			currentRules.push({
				test,
				"exclude": "/node_modules/",
				"loader": loader,
				"options": {
					"configFile": "../.babelrc"
				  }
			});

			prop.set(json, 'webpack.rules', currentRules);
		});
	}

	/**
	 * Add webpack extensions to the .npmbuildrc file.
	 * @param {Array<string>} extensions the file extensions to add
	 */
	addWebpackExtensions(...extensions) {
		this.modifyJson((json) => {
			const currentExtensions = prop.get(json, 'webpack.extensions', []);

			currentExtensions.push(...extensions);

			prop.set(json, 'webpack.extensions', currentExtensions);
		});
	}
}
