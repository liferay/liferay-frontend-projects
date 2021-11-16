/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 *
 */
export default class URLBuilder {

	/**
	 * Creates an instance of URLBuilder class
	 * @constructor
	 * @param {Config} config
	 */
	constructor(config) {
		this._config = config;
	}

	/**
	 * Returns a list of URLs from provided list of modules.
	 * @param {array} moduleNames list of modules for which URLs should be
	 * 								created
	 * @return {array} list of URLs
	 */
	build(moduleNames) {
		const config = this._config;

		const bufferURL = [];
		const modulesURL = [];
		let result = [];

		let basePath = config.basePath;

		if (basePath.length && basePath.charAt(basePath.length - 1) !== '/') {
			basePath += '/';
		}

		moduleNames.forEach((moduleName) => {
			const module = config.getModule(moduleName);

			const path = this._getModulePath(module);

			if (config.combine) {
				bufferURL.push(path);
				modulesURL.push(module.name);
			}
			else {
				result.push({
					modules: [module.name],
					url: this._getURLWithParams(config.url + basePath + path),
				});
			}
		});

		// Add to the result all modules, which have to be combined.

		if (bufferURL.length) {
			result = result.concat(
				this._generateBufferURLs(modulesURL, bufferURL, {
					basePath,
					url: config.url,
					urlMaxLength: config.urlMaxLength,
				})
			);
			bufferURL.length = 0;
		}

		return result;
	}

	/**
	 * Generate the appropriate set of URLs based on the list of
	 * required modules and the maximum allowed URL length
	 * @param {Array<String>} modules Array of module names
	 * @param {Array<String>} urls Array of module URLs
	 * @param {Object} config Configuration object containing URL, basePath and
	 *     						urlMaxLength
	 * @return {Array<Object>} Resulting array of {modules, url} objects
	 */
	_generateBufferURLs(modules, urls, config) {
		const basePath = config.basePath;
		const result = [];
		const urlMaxLength = config.urlMaxLength;

		let urlResult = {
			modules: [modules[0]],
			url: config.url + basePath + urls[0],
		};

		for (let i = 1; i < urls.length; i++) {
			const module = modules[i];
			const path = urls[i];

			if (
				urlResult.url.length + basePath.length + path.length + 1 <
				urlMaxLength
			) {
				urlResult.modules.push(module);
				urlResult.url += '&' + basePath + path;
			}
			else {
				result.push(urlResult);

				urlResult = {
					modules: [module],
					url: config.url + basePath + path,
				};
			}
		}

		urlResult.url = this._getURLWithParams(urlResult.url);

		result.push(urlResult);

		return result;
	}

	/**
	 * Returns the path for a module. If module has property path, it will be
	 * returned directly. Otherwise, the name of module will be used and
	 * extension .js will be added to module name if omitted.
	 * @param {object} module The module which path should be returned.
	 * @return {string} Module path.
	 */
	_getModulePath(module) {
		const paths = this._config.paths;

		let path = module.name;

		Object.keys(paths).forEach((item) => {
			if (path === item || path.indexOf(item + '/') === 0) {
				path = paths[item] + path.substring(item.length);
			}
		});

		if (path.lastIndexOf('.js') !== path.length - 3) {
			path += '.js';
		}

		return path;
	}

	/**
	 * Returns an url with parameters defined in config.defaultURLParams. If
	 * config.defaultURLParams is not defined or is an empty map, the url will
	 * be returned unmodified.
	 * @param {string} url The url to be returned with parameters.
	 * @return {string} url The url with parameters.
	 */
	_getURLWithParams(url) {
		const config = this._config;

		const defaultURLParams = config.defaultURLParams || {};

		const keys = Object.keys(defaultURLParams);

		if (!keys.length) {
			return url;
		}

		const queryString = keys
			.map((key) => {
				return key + '=' + defaultURLParams[key];
			})
			.join('&');

		return url + (url.indexOf('?') > -1 ? '&' : '?') + queryString;
	}
}
