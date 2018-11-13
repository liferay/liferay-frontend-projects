import os from 'os';

import {JsonModifier} from '..';

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
		this.modifyJson(json => {
			json.liferayDir = liferayDir;
		});
	}

	/**
	 * Set webpack's main module.
	 * @param {string} mainModule
	 */
	setWebpackMainModule(mainModule) {
		this.modifyJson(json => {
			json.webpack = json.webpack || {};
			json.webpack.mainModule = mainModule;
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

		this.modifyJson(json => {
			let test = regex.toString();

			test = test.substring(1, test.length - 1);

			json.webpack = json.webpack || {};
			json.webpack.rules = json.webpack.rules || [];
			json.webpack.rules.push({
				test: test,
				use: loader,
			});
		});
	}

	/**
	 * Add webpack extensions to the .npmbuildrc file.
	 * @param {Array<string>} extensions the file extensions to add
	 */
	addWebpackExtensions(...extensions) {
		this.modifyJson(json => {
			json.webpack = json.webpack || {};
			json.webpack.extensions = json.webpack.extensions || [];
			json.webpack.extensions.push(...extensions);
		});
	}
}
