/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A class that calls the server to resolve module dependencies.
 */
export default class DependencyResolver {

	/**
	 * Creates an instance of DependencyResolver class
	 * @constructor
	 * @param {Config} config
	 */
	constructor(config) {
		this._config = config;

		this._cachedResolutions = {};
	}

	/**
	 * Resolves modules dependencies
	 * @param {array} modules list of modules which dependencies should be
	 *     						resolved
	 * @return {array} list of module names, representing module dependencies
	 *     				(module name itself is being returned too)
	 */
	resolve(modules) {
		if (modules === undefined || modules.length === 0) {
			throw new Error(`Argument 'modules' cannot be undefined or empty`);
		}

		const config = this._config;

		return new Promise((resolve, reject) => {
			const resolution = this._cachedResolutions[modules];

			if (resolution) {
				resolve(resolution);

				return;
			}

			const modulesParam = `modules=${encodeURIComponent(modules)}`;

			let url = `${config.resolvePath}?${modulesParam}`;
			let options = {};

			if (url.length > config.urlMaxLength) {
				url = config.resolvePath;
				options = {
					body: modulesParam,
					method: 'POST',
				};
			}

			fetch(url, options)
				.then((response) => response.text())
				.then((text) => {
					const resolution = JSON.parse(text);

					this._cachedResolutions[modules] = resolution;
					resolve(resolution);
				})
				.catch(reject);
		});
	}
}
