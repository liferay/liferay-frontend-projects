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
		this._config = {maps: {}, paths: {}};
		this._modules = {};

		for (let key in config) {
			if (config.hasOwnProperty(key)) {
				this._config[key] = config[key];
			}
		}
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
	 * Adds a module to the configuration with default field values if it
	 * doesn't exist. Otherwise, returns the module.
	 * @param {string} moduleName
	 * @return {Object} the module
	 */
	addModule(moduleName) {
		let module = this._modules[moduleName];

		if (!module) {
			this._modules[moduleName] = module = new Module(moduleName);
		}

		return module;
	}

	/**
	 * Add mappings to the current configuration
	 * @param {object} mappings an object with one or more mappings
	 */
	addMappings(mappings) {
		Object.assign(this._config.maps, mappings);
	}

	/**
	 * Add path mappings to the current configuration
	 * @param {object} paths an object with one or more path mappings
	 */
	addPaths(paths) {
		Object.assign(this._config.paths, paths);
	}

	/**
	 * Map a list of module names at once
	 * @param {Array} moduleNames module names to map
	 * @return {Array} mapped module names
	 */
	mapModules(moduleNames) {
		return moduleNames.map(moduleName => this.mapModule(moduleName));
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
	 * @param {string} moduleName The module which have to be mapped
	 * @param {?object} contextMap Contextual module mapping information
	 *     relevant to the current load operation
	 * @return {array} The mapped module
	 */
	mapModule(moduleName, contextMap) {
		if (!this._config.maps && !contextMap) {
			return moduleName;
		}

		if (contextMap) {
			moduleName = this._mapMatches(moduleName, contextMap);
		}

		if (this._config.maps) {
			moduleName = this._mapMatches(moduleName, this._config.maps);
		}

		return moduleName;
	}

	/**
	 * Returns map with all registered modules or the requested subset of them.
	 * @param {?Array} moduleNames optional list of module names to retrieve
	 * @return {Array}
	 */
	getModules(moduleNames) {
		if (moduleNames) {
			return moduleNames.map(moduleName => this.getModule(moduleName));
		} else {
			return this._modules;
		}
	}

	/**
	 * Returns the registered module for the moduleName. If not found it maps
	 * the module name and return the registeredModule for the mapped name.
	 * @param {string} moduleName the module name
	 * @param {?object} contextMap contextual module mapping information
	 *     relevant to the current load operation
	 * @return {Object} the registed module object
	 */
	getModule(moduleName, contextMap) {
		let module = this._modules[moduleName];

		if (!module) {
			const mappedName = this.mapModule(moduleName, contextMap);

			module = this._modules[mappedName];
		}

		return module;
	}

	/**
	 * Creates a function that transforms module names based on a provided
	 * set of mappings.
	 *
	 * @protected
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
}

/**
 *
 */
class Module {
	/**
	 *
	 * @param {string} name
	 */
	constructor(name) {
		this._name = name;
		this._factory = undefined;
		this._implementation = undefined;
		this._fetched = false;
		this._defined = false;
		this._implemented = false;
	}

	/* eslint-disable require-jsdoc */

	get name() {
		return this._name;
	}

	get factory() {
		return this._factory;
	}

	get implementation() {
		return this._implementation;
	}

	get fetched() {
		return this._fetched;
	}

	get defined() {
		return this._defined;
	}

	get implemented() {
		return this._implemented;
	}

	set name(name) {
		throw new Error(`Name of module ${this.name} is read-only`);
	}

	set factory(factory) {
		if (this._factory) {
			throw new Error(`Factory of module ${this.name} already set`);
		}

		this._factory = factory;
	}

	set implementation(implementation) {
		if (this._implementation) {
			throw new Error(
				`Implementation of module ${this.name} already set`
			);
		}

		this._implementation = implementation;
	}

	set fetched(fetched) {
		if (this._fetched) {
			throw new Error(`Fetched flag of module ${this.name} already set`);
		}

		this._fetched = fetched;
	}

	set defined(defined) {
		if (this._defined) {
			throw new Error(`Defined flag of module ${this.name} already set`);
		}

		this._defined = defined;
	}

	set implemented(implemented) {
		if (this._implemented) {
			throw new Error(
				`Implemented flag of module ${this.name} already set`
			);
		}

		this._implemented = implemented;
	}

	/* eslint-enable require-jsdoc */
}
