/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import URLBuilder from './url-builder';

/**
 * A class responsible for loading the script resources that contain modules
 * from the server.
 */
export default class ScriptLoader {

	/**
	 * @param {object} document DOM document object to use
	 * @param {Config} config
	 * @param {Logger} log
	 */
	constructor(document, config, log) {
		this._document = document;
		this._config = config;
		this._log = log;

		this._urlBuilder = new URLBuilder(config);

		this._injectedScripts = {};
	}

	/**
	 * Loads list of modules
	 * @param {Array} moduleNames List of modules to be loaded.
	 * @return {Promise} Promise which will be resolved as soon as all modules
	 * 						have been loaded.
	 */
	loadModules(moduleNames) {
		const urlBuilder = this._urlBuilder;

		if (!moduleNames.length) {
			return Promise.resolve();
		}

		const modulesURLs = urlBuilder.build(moduleNames);

		const promises = modulesURLs.map((modulesURL) =>
			this._loadScript(modulesURL)
		);

		return Promise.all(promises);
	}

	/**
	 * Places a script element on the page and waits for it to load.
	 * @param {object} modulesURL an object with two properties:
	 * 					- modules: list of the modules which should be loaded
	 * 					- url: the URL from which the modules should be loaded
	 * @return {Promise} a Promise which will be resolved as soon as the script
	 * 						is loaded
	 */
	_loadScript(modulesURL) {
		const config = this._config;
		const modules = config.getModules(modulesURL.modules);

		let script = this._injectedScripts[modulesURL.url];

		if (!script) {
			script = this._document.createElement('script');

			script.src = modulesURL.url;
			script.async = false;

			script.onload = script.onreadystatechange = () => {
				if (
					this.readyState &&
					this.readyState !== 'complete' &&
					this.readyState !== 'load'
				) {
					return;
				}

				script.onload = script.onreadystatechange = null;
				script.onerror = null;

				modules.forEach((module) => {
					if (module.fetch.fulfilled) {
						this._log.warn(
							`Module '${module.name}' is being fetched from\n`,
							script.src,
							'but was already fetched from\n',
							module.fetch.resolved
								? module.fetch.resolution.src
								: module.fetch.rejection.script.src
						);

						return;
					}

					module.fetch.resolve(script);
				});
			};

			script.onerror = () => {
				script.onload = script.onreadystatechange = null;
				script.onerror = null;

				const error = Object.assign(
					new Error(
						`Unable to load script from URL ${modulesURL.url}`
					),
					{
						modules: modulesURL.modules,
						script,
						url: modulesURL.url,
					}
				);

				modules.forEach((module) => module.fetch.reject(error));
			};

			this._injectedScripts[modulesURL.url] = script;
			this._document.head.appendChild(script);
		}

		return Promise.all(modules.map((module) => module.fetch));
	}
}
