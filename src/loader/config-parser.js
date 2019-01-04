/**
 *
 */
export default class ConfigParser {
	/**
	 * Creates an instance of ConfigurationParser class.
	 *
	 * @constructor
	 * @param {object=} config - The configuration object to be parsed.
	 */
	constructor(config) {
		this._config = {};
		this._modules = {};
		this._conditionalModules = {};

		this._parseConfig(config);
	}

	/**
	 * Adds a module to the configuration.
	 *
	 * @param {object} module The module which should be added to the
	 *     configuration. Should have the following properties:
	 *     <ul>
	 *         <strong>Obligatory properties</strong>:
	 *         <li>name (String) The name of the module</li>
	 *         <li>dependencies (Array) The modules from which it depends</li>
	 *     </ul>
	 *
	 *     <strong>Optional properties:</strong>
	 *     The same as those which config parameter of {@link Loader#define}
	 *     method accepts.
	 * @return {Object} The added module
	 */
	addModule(module) {
		// Module might be added via configuration or when it arrives from the
		// server. If it arrives from the server, it will have already a
		// definition. In this case, we will overwrite the existing properties
		// with those, provided from the module definition. Otherwise, we will
		// just add it to the map.
		const moduleDefinition = this._modules[module.name];

		if (moduleDefinition) {
			for (let key in module) {
				if (Object.prototype.hasOwnProperty.call(module, key)) {
					moduleDefinition[key] = module[key];
				}
			}
		} else {
			this._modules[module.name] = module;
		}

		this._registerConditionalModule(module);

		return this._modules[module.name];
	}

	/**
	 * Returns the current configuration.
	 *
	 * @return {object} The current configuration.
	 */
	getConfig() {
		return this._config;
	}

	/**
	 * Returns map with all currently registered conditional modules and their
	 * triggers.
	 *
	 * @return {object} Map with all currently registered conditional modules.
	 */
	getConditionalModules() {
		return this._conditionalModules;
	}

	/**
	 * Returns map with all currently registered modules.
	 *
	 * @return {object} Map with all currently registered modules.
	 */
	getModules() {
		return this._modules;
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
	 *
	 * @protected
	 * @param {array|string} module The module which have to be mapped or array
	 *     of modules.
	 * @param {?object} contextMap Contextual module mapping information
	 *     relevant to the current load operation
	 * @return {array|string} The mapped module or array of mapped modules.
	 */
	mapModule(module, contextMap) {
		if (!this._config.maps && !contextMap) {
			return module;
		}

		let modules;

		if (Array.isArray(module)) {
			modules = module;
		} else {
			modules = [module];
		}

		if (contextMap) {
			modules = modules.map(this._getModuleMapper(contextMap));
		}

		if (this._config.maps) {
			modules = modules.map(this._getModuleMapper(this._config.maps));
		}

		return Array.isArray(module) ? modules : modules[0];
	}

	/**
	 * Creates a function that transforms module names based on a provided
	 * set of mappings.
	 *
	 * @protected
	 * @param {object} maps Mapping information.
	 * @return {function} The generated mapper function
	 */
	_getModuleMapper(maps) {
		return module => {
			let match = maps[module];

			if (match) {
				if (typeof match === 'object') {
					return match.value;
				}

				return match;
			}

			match = this._mapExactMatch(module, maps);

			// Apply partial mapping only if exactMatch hasn't been
			// already applied for this mapping
			if (!match) {
				match = this._mapPartialMatch(module, maps);
			}

			// Apply * mapping only if neither exactMatch nor
			// partialMatch have been already applied for this mapping
			if (!match) {
				match = this._mapWildcardMatch(module, maps);
			}

			return match || module;
		};
	}

	/**
	 * Transforms a module name using the exactMatch mappings
	 * in a provided mapping object.
	 *
	 * @protected
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     `result` field containing the mapped module name
	 */
	_mapExactMatch(module, maps) {
		for (let alias in maps) {
			/* istanbul ignore else */
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
	 *
	 * @protected
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     `result` field containing the mapped module name
	 */
	_mapPartialMatch(module, maps) {
		for (let alias in maps) {
			/* istanbul ignore else */
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
	 *
	 * @protected
	 * @param {string} module The module which have to be mapped.
	 * @param {object} maps Mapping information.
	 * @return {object} An object with a boolean `matched` field and a string
	 *     `result` field containing the mapped module name
	 */
	_mapWildcardMatch(module, maps) {
		if (typeof maps['*'] === 'function') {
			return maps['*'](module);
		}
	}

	/**
	 * Parses configuration object.
	 *
	 * @protected
	 * @param {object} config Configuration object to be parsed.
	 * @return {object} The created configuration
	 */
	_parseConfig(config) {
		for (let key in config) {
			/* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(config, key)) {
				if (key === 'modules') {
					this._parseModules(config[key]);
				} else {
					this._config[key] = config[key];
				}
			}
		}

		return this._config;
	}

	/**
	 * Parses a provided modules configuration.
	 *
	 * @protected
	 * @param {object} modules Map of modules to be parsed.
	 * @return {object} Map of parsed modules.
	 */
	_parseModules(modules) {
		for (let key in modules) {
			/* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(modules, key)) {
				let module = modules[key];

				module.name = key;

				this.addModule(module);
			}
		}

		return this._modules;
	}

	/**
	 * Registers conditional module to the configuration.
	 *
	 * @protected
	 * @param {object} module Module object
	 */
	_registerConditionalModule(module) {
		// Create HashMap of all modules, which have conditional modules, as an
		// Array.
		if (module.condition) {
			let existingModules = this._conditionalModules[
				module.condition.trigger
			];

			if (!existingModules) {
				this._conditionalModules[
					module.condition.trigger
				] = existingModules = [];
			}

			existingModules.push(module.name);
		}
	}
}
