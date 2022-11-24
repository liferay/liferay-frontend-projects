/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Module from './module';

/**
 *
 */
export default class Config {

	/**
	 * Creates an instance of Configuration class
	 * @constructor
	 * @param {object=} cfg configuration properties
	 */
	constructor(cfg = {}) {
		this._modules = {};
		this._maps = {};
		this._paths = {};

		this._config = {maps: {}, paths: {}};
		this._parse(cfg, 'defaultURLParams', {});
		this._parse(cfg, 'explainResolutions', false);
		this._parse(cfg, 'showWarnings', false);
		this._parse(cfg, 'waitTimeout', 7000);
		this._parse(cfg, 'basePath', '/');
		this._parse(cfg, 'resolvePath', '/o/js_resolve_modules');
		this._parse(cfg, 'combine', false);
		this._parse(cfg, 'url', '');
		this._parse(cfg, 'urlMaxLength', 2000);
		this._parse(cfg, 'logLevel', 'error');
		this._parse(cfg, 'moduleType', 'module');
	}

	/**
	 * Whether to explain how require() calls are resolved
	 */
	get explainResolutions() {
		return this._config.explainResolutions;
	}

	/**
	 * Whether to show development warnings
	 */
	get showWarnings() {
		return this._config.showWarnings;
	}

	/**
	 * Time to wait for module script requests to load (in milliseconds)
	 */
	get waitTimeout() {
		return this._config.waitTimeout;
	}

	/**
	 * The base path from where modules must be retrieved
	 */
	get basePath() {
		return this._config.basePath;
	}

	/**
	 * The path to use when calling the server to resolve module dependencies
	 */
	get resolvePath() {
		return this._config.resolvePath;
	}

	/**
	 * Whether to combine module requests into combo URLs
	 */
	get combine() {
		return this._config.combine;
	}

	/**
	 * The URL of the server
	 */
	get url() {
		return this._config.url;
	}

	/**
	 * The maximum length of a combo URL. If URL is larger than that it is split
	 * in as many requests as needed.
	 */
	get urlMaxLength() {
		return this._config.urlMaxLength;
	}

	get logLevel() {
		return this._config.logLevel;
	}

	/**
	 * The type to use for ESM <script> nodes.
	 */
	get moduleType() {
		return this._config.moduleType;
	}

	/**
	 * Default parameters to add to the module request URLs
	 */
	get defaultURLParams() {
		return this._config.defaultURLParams;
	}

	/**
	 * An object with registered module paths
	 */
	get paths() {
		return this._paths;
	}

	/**
	 * Adds a module to the configuration with default field values if it
	 * doesn't exist. Otherwise, throws an exception.
	 * @param {string} moduleName
	 * @param {object} moduleProperties initial properties to set on module in
	 * 									addition to its name
	 * @return {Object} the module
	 */
	addModule(moduleName, moduleProperties = {}) {
		if (this._modules[moduleName]) {
			throw new Error(`Module is already registered: ${moduleName}`);
		}

		const module = new Module(moduleName);

		Object.entries(moduleProperties).forEach(([key, value]) => {
			module[key] = value;
		});

		this._modules[moduleName] = module;

		return module;
	}

	/**
	 * Add mappings to the current configuration
	 * @param {object} mappings an object with one or more mappings
	 */
	addMappings(mappings) {
		Object.assign(this._maps, mappings);
	}

	/**
	 * Add path mappings to the current configuration
	 * @param {object} paths an object with one or more path mappings
	 */
	addPaths(paths) {
		Object.assign(this._paths, paths);
	}

	/**
	 * Returns array with all registered modules or the requested subset of
	 * them.
	 * @param {?Array} moduleNames optional list of module names to retrieve
	 * @return {Array}
	 */
	getModules(moduleNames = undefined) {
		if (moduleNames === undefined) {
			return Object.values(this._modules);
		}

		return moduleNames.map((moduleName) => this.getModule(moduleName));
	}

	/**
	 * Returns the registered module for the moduleName.
	 * @param {string} moduleName the module name
	 * @return {Object} the registed module object
	 */
	getModule(moduleName) {
		let module = this._modules[moduleName];

		if (!module) {
			const mappedName = this._mapModule(moduleName);

			module = this._modules[mappedName];
		}

		return module;
	}

	/**
	 * Returns the registered module for the dependency of moduleName.
	 * @param {string} moduleName the module name
	 * @param {string} dependencyName the dependencyName name
	 * @return {Object} the registed module object
	 */
	getDependency(moduleName, dependencyName) {
		const module = this.getModule(moduleName);

		let dependencyModule = this._modules[dependencyName];

		if (!dependencyModule) {
			const mappedName = this._mapModule(dependencyName, module.map);

			dependencyModule = this._modules[mappedName];
		}

		return dependencyModule;
	}

	/**
	 * Update the resolve path (usually as a consequence of a redirect being
	 * received from the server when a module resolution is attempted).
	 * @param {string} resolvePath the updated resolve path
	 * @return {void}
	 */
	updateResolvePath(resolvePath) {
		const prefix = `${window.location.protocol}//${window.location.host}`;

		if (resolvePath.startsWith(prefix)) {
			resolvePath = resolvePath.substr(prefix.length);
		}

		this._config.resolvePath = resolvePath;
	}

	/**
	 * Parse a configuration property to store it in _config.
	 * @param {object} cfg
	 * @param {string} property
	 * @param {*} defaultValue
	 */
	_parse(cfg, property, defaultValue) {
		this._config[property] = Object.prototype.hasOwnProperty.call(
			cfg,
			property
		)
			? cfg[property]
			: defaultValue;
	}

	/**
	 * Maps module names to their aliases. Example:
	 * __CONFIG__.maps = {
	 *      liferay: 'liferay@1.0.0'
	 * }
	 *
	 * When someone does require('liferay/html/js/ac.es',...),
	 * if the module 'liferay/html/js/ac.es' is not defined,
	 * then a corresponding alias will be searched. If found, the name will be
	 * replaced, so it will look like user did
	 * require('liferay@1.0.0/html/js/ac.es',...).
	 *
	 * Additionally, modules can define a custom map to alias module names just
	 * in the context of that module loading operation. When present, the
	 * contextual module mapping will take precedence over the general one.
	 * @param {string} moduleName The module which have to be mapped
	 * @param {?object} contextMap Contextual module mapping information
	 *     relevant to the current load operation
	 * @return {array} The mapped module
	 */
	_mapModule(moduleName, contextMap) {
		if (contextMap) {
			moduleName = this._mapMatches(moduleName, contextMap);
		}

		if (Object.keys(this._maps).length) {
			moduleName = this._mapMatches(moduleName, this._maps);
		}

		return moduleName;
	}

	/**
	 * Creates a function that transforms module names based on a provided
	 * set of mappings.
	 * @param {string} moduleName module name
	 * @param {object} maps Mapping information.
	 * @return {function} The generated mapper function
	 */
	_mapMatches(moduleName, maps) {
		let match = maps[moduleName];

		if (match) {
			if (typeof match === 'object') {
				return match.value;
			}

			return match;
		}

		match = this._mapExactMatch(moduleName, maps);

		// Apply partial mapping only if exactMatch hasn't been
		// already applied for this mapping

		if (!match) {
			match = this._mapPartialMatch(moduleName, maps);
		}

		// Apply * mapping only if neither exactMatch nor
		// partialMatch have been already applied for this mapping

		if (!match) {
			match = this._mapWildcardMatch(moduleName, maps);
		}

		return match || moduleName;
	}

	/**
	 * Transforms a module name using the exactMatch mappings
	 * in a provided mapping object.
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     					`result` field containing the mapped module name
	 */
	_mapExactMatch(module, maps) {
		for (const alias in maps) {
			if (Object.prototype.hasOwnProperty.call(maps, alias)) {
				const aliasValue = maps[alias];

				if (aliasValue.value && aliasValue.exactMatch) {
					if (module === alias) {
						return aliasValue.value;
					}
				}
			}
		}
	}

	/**
	 * Transforms a module name using the partial mappings
	 * in a provided mapping object.
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     					`result` field containing the mapped module name
	 */
	_mapPartialMatch(module, maps) {
		for (const alias in maps) {
			if (Object.prototype.hasOwnProperty.call(maps, alias)) {
				let aliasValue = maps[alias];

				if (!aliasValue.exactMatch) {
					if (aliasValue.value) {
						aliasValue = aliasValue.value;
					}

					if (module === alias || module.indexOf(alias + '/') === 0) {
						return aliasValue + module.substring(alias.length);
					}
				}
			}
		}
	}

	/**
	 * Transforms a module name using the wildcard mapping in a provided mapping
	 * object.
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     					`result` field containing the mapped module name
	 */
	_mapWildcardMatch(module, maps) {
		if (typeof maps['*'] === 'function') {
			return maps['*'](module);
		}
	}
}
