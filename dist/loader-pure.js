(function() {
	var global = {};

	global.__CONFIG__ = window.__CONFIG__;

	(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.EventEmitter = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of EventEmitter class.
 *
 * @constructor
 */
function EventEmitter() {
	this._events = {};
}

EventEmitter.prototype = {
	constructor: EventEmitter,

	/**
     * Adds event listener to an event.
     *
     * @param {string} event The name of the event.
     * @param {Function} callback Callback method to be invoked when event is being emitted.
     */
	on: function(event, callback) {
		var listeners = (this._events[event] = this._events[event] || []);

		listeners.push(callback);
	},

	/**
     * Removes an event from the list of event listeners to some event.
     *
     * @param {string} event The name of the event.
     * @param {function} callback Callback method to be removed from the list of listeners.
     */
	off: function(event, callback) {
		var listeners = this._events[event];

		if (listeners) {
			var callbackIndex = listeners.indexOf(callback);

			if (callbackIndex > -1) {
				listeners.splice(callbackIndex, 1);
			} else {
				void 0;
			}
		} else {
			void 0;
		}
	},

	/**
     * Emits an event. The function calls all registered listeners in the order they have been added. The provided args
     * param will be passed to each listener of the event.
     *
     * @param {string} event The name of the event.
     * @param {object} args Object, which will be passed to the listener as only argument.
     */
	emit: function(event, args) {
		var listeners = this._events[event];

		if (listeners) {
			// Slicing is needed to prevent the following situation:
			// A listener is being invoked. During its execution, it may
			// remove itself from the list. In this case, for loop will
			// be damaged, since i will be out of sync.
			listeners = listeners.slice(0);

			for (var i = 0; i < listeners.length; i++) {
				var listener = listeners[i];

				listener.call(listener, args);
			}
		} else {
			void 0;
		}
	},
};


    return EventEmitter;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.ConfigParser = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of ConfigurationParser class.
 *
 * @constructor
 * @param {object=} config - The configuration object to be parsed.
 */
function ConfigParser(config) {
	this._config = {};
	this._modules = {};
	this._conditionalModules = {};

	this._parseConfig(config);
}

ConfigParser.prototype = {
	constructor: ConfigParser,

	/**
     * Adds a module to the configuration.
     *
     * @param {object} module The module which should be added to the configuration. Should have the following
     *     properties:
     *     <ul>
     *         <strong>Obligatory properties</strong>:
     *         <li>name (String) The name of the module</li>
     *         <li>dependencies (Array) The modules from which it depends</li>
     *     </ul>
     *
     *     <strong>Optional properties:</strong>
     *     The same as those which config parameter of {@link Loader#define} method accepts.
     * @return {Object} The added module
     */
	addModule: function(module) {
		// Module might be added via configuration or when it arrives from the server.
		// If it arrives from the server, it will have already a definition. In this case,
		// we will overwrite the existing properties with those, provided from the module definition.
		// Otherwise, we will just add it to the map.
		var moduleDefinition = this._modules[module.name];

		if (moduleDefinition) {
			for (var key in module) {
				if (Object.prototype.hasOwnProperty.call(module, key)) {
					moduleDefinition[key] = module[key];
				}
			}
		} else {
			this._modules[module.name] = module;
		}

		this._registerConditionalModule(module);

		return this._modules[module.name];
	},

	/**
     * Returns the current configuration.
     *
     * @return {object} The current configuration.
     */
	getConfig: function() {
		return this._config;
	},

	/**
     * Returns map with all currently registered conditional modules and their triggers.
     *
     * @return {object} Map with all currently registered conditional modules.
     */
	getConditionalModules: function() {
		return this._conditionalModules;
	},

	/**
     * Returns map with all currently registered modules.
     *
     * @return {object} Map with all currently registered modules.
     */
	getModules: function() {
		return this._modules;
	},

	/**
     * Maps module names to their aliases. Example:
     * __CONFIG__.maps = {
     *      liferay: 'liferay@1.0.0'
     * }
     *
     * When someone does require('liferay/html/js/ac.es',...),
     * if the module 'liferay/html/js/ac.es' is not defined,
     * then a corresponding alias will be searched. If found, the name will be replaced,
     * so it will look like user did require('liferay@1.0.0/html/js/ac.es',...).
     *
     * Additionally, modules can define a custom map to alias module names just in the context
     * of that module loading operation. When present, the contextual module mapping will take
     * precedence over the general one.
     *
     * @protected
     * @param {array|string} module The module which have to be mapped or array of modules.
     * @param {?object} contextMap Contextual module mapping information relevant to the current load operation
     * @return {array|string} The mapped module or array of mapped modules.
     */
	mapModule: function(module, contextMap) {
		if (!this._config.maps && !contextMap) {
			return module;
		}

		var modules;

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
	},

	/**
     * Creates a function that transforms module names based on a provided
     * set of mappings.
     *
     * @protected
     * @param {object} maps Mapping information.
     * @return {function} The generated mapper function
     */
	_getModuleMapper: function(maps) {
		return function(module) {
			var match;

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
		}.bind(this);
	},

	/**
     * Transforms a module name using the exactMatch mappings
     * in a provided mapping object.
     *
     * @protected
     * @param {string} module The module which have to be mapped.
     * @param {object} maps Mapping information.
     * @return {object} An object with a boolean `matched` field and a string `result` field containing the mapped module name
     */
	_mapExactMatch: function(module, maps) {
		for (var alias in maps) {
			/* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(maps, alias)) {
				var aliasValue = maps[alias];

				if (aliasValue.value && aliasValue.exactMatch) {
					if (module === alias) {
						return aliasValue.value;
					}
				}
			}
		}
	},

	/**
     * Transforms a module name using the partial mappings
     * in a provided mapping object.
     *
     * @protected
     * @param {string} module The module which have to be mapped.
     * @param {object} maps Mapping information.
     * @return {object} An object with a boolean `matched` field and a string `result` field containing the mapped module name
     */
	_mapPartialMatch: function(module, maps) {
		for (var alias in maps) {
			/* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(maps, alias)) {
				var aliasValue = maps[alias];

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
	},

	/**
     * Transforms a module name using the wildcard mapping in a provided mapping
     * object.
     *
     * @protected
     * @param {string} module The module which have to be mapped.
     * @param {object} maps Mapping information.
     * @return {object} An object with a boolean `matched` field and a string `result` field containing the mapped module name
     */
	_mapWildcardMatch: function(module, maps) {
		if (typeof maps['*'] === 'function') {
			return maps['*'](module);
		}
	},

	/**
     * Parses configuration object.
     *
     * @protected
     * @param {object} config Configuration object to be parsed.
     * @return {object} The created configuration
     */
	_parseConfig: function(config) {
		for (var key in config) {
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
	},

	/**
     * Parses a provided modules configuration.
     *
     * @protected
     * @param {object} modules Map of modules to be parsed.
     * @return {object} Map of parsed modules.
     */
	_parseModules: function(modules) {
		for (var key in modules) {
			/* istanbul ignore else */
			if (Object.prototype.hasOwnProperty.call(modules, key)) {
				var module = modules[key];

				module.name = key;

				this.addModule(module);
			}
		}

		return this._modules;
	},

	/**
     * Registers conditional module to the configuration.
     *
     * @protected
     * @param {object} module Module object
     */
	_registerConditionalModule: function(module) {
		// Create HashMap of all modules, which have conditional modules, as an Array.
		if (module.condition) {
			var existingModules = this._conditionalModules[
				module.condition.trigger
			];

			if (!existingModules) {
				this._conditionalModules[
					module.condition.trigger
				] = existingModules = [];
			}

			existingModules.push(module.name);
		}
	},
};


    return ConfigParser;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.DependencyBuilder = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Creates an instance of DependencyBuilder class.
 *
 * @constructor
 * @param {object} configParser - instance of {@link ConfigParser} object.
 */
function DependencyBuilder(configParser) {
	this._configParser = configParser;
	this._pathResolver = new global.PathResolver();

	this._result = [];
}

DependencyBuilder.prototype = {
	constructor: DependencyBuilder,

	/**
     * Resolves modules dependencies.
     *
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {array} List of module names, representing module dependencies. Module name itself is being returned too.
     */
	resolveDependencies: function(modules) {
		// Copy the passed modules to a resolving modules queue.
		// Modules may be added there during the process of resolving.
		this._queue = modules.slice(0);

		var result;

		try {
			this._resolveDependencies();

			// Reorder the modules list so the modules without dependencies will
			// be moved upfront
			result = this._result.reverse().slice(0);
		} finally {
			this._cleanup();
		}

		return result;
	},

	/**
     * Clears the used resources during the process of resolving dependencies.
     *
     * @protected
     */
	_cleanup: function() {
		var modules = this._configParser.getModules();

		// Set to false all temporary markers which were set during the process of
		// dependencies resolving.
		for (var key in modules) {
			/* istanbul ignore else */
			if (hasOwnProperty.call(modules, key)) {
				var module = modules[key];

				module.conditionalMark = false;
				module.mark = false;
				module.tmpMark = false;
			}
		}

		this._queue.length = 0;
		this._result.length = 0;
	},

	/**
     * Processes conditional modules. If a module has conditional module as dependency, this module will be added to
     * the list of modules, which dependencies should be resolved.
     *
     * @protected
     * @param {object} module Module, which will be checked for conditional modules as dependencies.
     */
	_processConditionalModules: function(module) {
		var conditionalModules = this._configParser.getConditionalModules()[
			module.name
		];

		// If the current module has conditional modules as dependencies,
		// add them to the list (queue) of modules, which have to be resolved.
		if (conditionalModules && !module.conditionalMark) {
			var modules = this._configParser.getModules();

			for (var i = 0; i < conditionalModules.length; i++) {
				var conditionalModule = modules[conditionalModules[i]];

				if (
					this._queue.indexOf(conditionalModule.name) === -1 &&
					this._testConditionalModule(
						conditionalModule.condition.test
					)
				) {
					this._queue.push(conditionalModule.name);
				}
			}

			module.conditionalMark = true;
		}
	},

	/**
     * Processes all modules in the {@link DependencyBuilder#_queue} and resolves their dependencies.
     * If the module is not registered to the configuration, it will be automatically added there with no
     * dependencies. The function implements a standard
     * [topological sorting based on depth-first search]{@link http://en.wikipedia.org/wiki/Topological_sorting}.
     *
     * @protected
     */
	_resolveDependencies: function() {
		// Process all modules in the queue.
		// Note: modules may be added to the queue during the process of evaluating.
		var modules = this._configParser.getModules();

		for (var i = 0; i < this._queue.length; i++) {
			var module = modules[this._queue[i]];

			// If not registered, add the module on the fly with no dependencies.
			// Note: the module name (this._queue[i]) is expected to be already mapped.
			if (!module) {
				module = this._configParser.addModule({
					name: this._queue[i],
					dependencies: [],
				});
			}

			if (!module.mark) {
				this._visit(module);
			}
		}
	},

	/**
     * Executes the test function of an conditional module and adds it to the list of module dependencies if the
     * function returns true.
     *
     * @param {function|string} testFunction The function which have to be executed. May be Function object or string.
     * @return {boolean} The result of the execution of the test function.
     */
	_testConditionalModule: function(testFunction) {
		if (typeof testFunction === 'function') {
			return testFunction();
		} else {
			return eval('false || ' + testFunction)();
		}
	},

	/**
     * Visits a module during the process of resolving dependencies. The function will throw exception in case of
     * circular dependencies among modules. If a dependency is not registered, it will be added to the configuration
     * as a module without dependencies.
     *
     * @protected
     * @param {object} module The module which have to be visited.
     */
	_visit: function(module) {
		// Directed Acyclic Graph is supported only, throw exception if there are circular dependencies.
		if (module.tmpMark) {
			throw new Error(
				'Error processing module: ' +
					module.name +
					'. ' +
					'The provided configuration is not Directed Acyclic Graph.'
			);
		}

		// Check if this module has conditional modules and add them to the queue if so.
		this._processConditionalModules(module);

		if (!module.mark) {
			module.tmpMark = true;

			var modules = this._configParser.getModules();

			for (var i = 0; i < module.dependencies.length; i++) {
				var dependencyName = module.dependencies[i];

				if (
					dependencyName === 'require' ||
					dependencyName === 'exports' ||
					dependencyName === 'module'
				) {
					continue;
				}

				// Resolve relative path and map the dependency to its alias
				dependencyName = this._pathResolver.resolvePath(
					module.name,
					dependencyName
				);

				// A module may have many dependencies so we should map them.
				var mappedDependencyName = this._configParser.mapModule(
					dependencyName,
					module.map
				);
				var moduleDependency = modules[mappedDependencyName];

				// Register on the fly all unregistered in the configuration dependencies as
				// modules without dependencies.
				if (!moduleDependency) {
					moduleDependency = this._configParser.addModule({
						name: mappedDependencyName,
						dependencies: [],
					});
				}

				this._visit(moduleDependency);
			}

			module.mark = true;

			module.tmpMark = false;

			this._result.unshift(module.name);
		}
	},

	/**
     * @property {array} _queue List of modules, which dependencies should be resolved. Initially, it is copy of
     * the array of modules, passed for resolving; during the process more modules may be added to the queue. For
     * example, these might be conditional modules.
     *
     * @protected
     * @memberof! DependencyBuilder#
     * @default []
     */
	_queue: [],
};


    return DependencyBuilder;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.URLBuilder = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

// External protocols regex, supports:
// "http", "https", "//" and "www."
var REGEX_EXTERNAL_PROTOCOLS = /^https?:\/\/|\/\/|www\./;

/**
 * Creates an instance of URLBuilder class.
 *
 * @constructor
 * @param {object} configParser - instance of {@link ConfigParser} object.
 */
function URLBuilder(configParser) {
	this._configParser = configParser;
}

URLBuilder.prototype = {
	constructor: URLBuilder,

	/**
     * Returns a list of URLs from provided list of modules.
     *
     * @param {array} modules List of modules for which URLs should be created.
     * @return {array} List of URLs.
     */
	build: function(modules) {
		var bufferAbsoluteURL = [];
		var bufferRelativeURL = [];
		var modulesAbsoluteURL = [];
		var modulesRelativeURL = [];
		var result = [];

		var config = this._configParser.getConfig();

		var basePath = config.basePath || '';
		var registeredModules = this._configParser.getModules();

		/* istanbul ignore else */
		if (basePath.length && basePath.charAt(basePath.length - 1) !== '/') {
			basePath += '/';
		}

		for (var i = 0; i < modules.length; i++) {
			var module = registeredModules[modules[i]];

			// If module has fullPath, individual URL have to be created.
			if (module.fullPath) {
				result.push({
					modules: [module.name],
					url: this._getURLWithParams(module.fullPath),
				});
			} else {
				var path = this._getModulePath(module);
				var absolutePath = path.indexOf('/') === 0;

				// If the URL starts with external protocol, individual URL shall be created.
				if (REGEX_EXTERNAL_PROTOCOLS.test(path)) {
					result.push({
						modules: [module.name],
						url: this._getURLWithParams(path),
					});

					// If combine is disabled, or the module is an anonymous one,
					// create an individual URL based on the config URL and module's path.
					// If the module's path starts with "/", do not include basePath in the URL.
				} else if (!config.combine || module.anonymous) {
					result.push({
						modules: [module.name],
						url: this._getURLWithParams(
							config.url + (absolutePath ? '' : basePath) + path
						),
					});
				} else {
					// If combine is true, this is not an anonymous module and the module does not have full path.
					// The module will be collected in a buffer to be loaded among with other modules from combo loader.
					// The path will be stored in different buffer depending on the fact if it is absolute URL or not.
					if (absolutePath) {
						bufferAbsoluteURL.push(path);
						modulesAbsoluteURL.push(module.name);
					} else {
						bufferRelativeURL.push(path);
						modulesRelativeURL.push(module.name);
					}
				}
			}

			module.requested = true;
		}

		// Add to the result all modules, which have to be combined.
		if (bufferRelativeURL.length) {
			result = result.concat(
				this._generateBufferURLs(
					modulesRelativeURL,
					bufferRelativeURL,
					{
						basePath: basePath,
						url: config.url,
						urlMaxLength: config.urlMaxLength,
					}
				)
			);
			bufferRelativeURL.length = 0;
		}

		if (bufferAbsoluteURL.length) {
			result = result.concat(
				this._generateBufferURLs(
					modulesAbsoluteURL,
					bufferAbsoluteURL,
					{
						url: config.url,
						urlMaxLength: config.urlMaxLength,
					}
				)
			);
			bufferAbsoluteURL.length = 0;
		}

		return result;
	},

	/**
     * Generate the appropriate set of URLs based on the list of
     * required modules and the maximum allowed URL length
     *
     * @param {Array<String>} modules Array of module names
     * @param {Array<String>} urls Array of module URLs
     * @param {Object} config Configuration object containing URL, basePath and urlMaxLength
     * @return {Array<Object>} Resulting array of {modules, url} objects
     */
	_generateBufferURLs: function(modules, urls, config) {
		var i;
		var basePath = config.basePath || '';
		var result = [];
		var urlMaxLength = config.urlMaxLength || 2000;

		var urlResult = {
			modules: [modules[0]],
			url: config.url + basePath + urls[0],
		};

		for (i = 1; i < urls.length; i++) {
			var module = modules[i];
			var path = urls[i];

			if (
				urlResult.url.length + basePath.length + path.length + 1 <
				urlMaxLength
			) {
				urlResult.modules.push(module);
				urlResult.url += '&' + basePath + path;
			} else {
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
	},

	/**
     * Returns the path for a module. If module has property path, it will be returned directly. Otherwise,
     * the name of module will be used and extension .js will be added to module name if omitted.
     *
     * @protected
     * @param {object} module The module which path should be returned.
     * @return {string} Module path.
     */
	_getModulePath: function(module) {
		var path = module.path || module.name;

		var paths = this._configParser.getConfig().paths || {};

		var found = false;
		Object.keys(paths).forEach(function(item) {
			/* istanbul ignore else */
			if (path === item || path.indexOf(item + '/') === 0) {
				path = paths[item] + path.substring(item.length);
			}
		});

		/* istanbul ignore else */
		if (!found && typeof paths['*'] === 'function') {
			path = paths['*'](path);
		}

		if (
			!REGEX_EXTERNAL_PROTOCOLS.test(path) &&
			path.lastIndexOf('.js') !== path.length - 3
		) {
			path += '.js';
		}

		return path;
	},

	/**
     * Returns an url with parameters defined in config.defaultURLParams. If
     * config.defaultURLParams is not defined or is an empty map, the url will
     * be returned unmodified.
     *
     * @protected
     * @param {string} url The url to be returned with parameters.
     * @return {string} url The url with parameters.
     */
	_getURLWithParams: function(url) {
		var config = this._configParser.getConfig();

		var defaultURLParams = config.defaultURLParams || {};

		var keys = Object.keys(defaultURLParams);

		if (!keys.length) {
			return url;
		}

		var queryString = keys
			.map(function(key) {
				return key + '=' + defaultURLParams[key];
			})
			.join('&');

		return url + (url.indexOf('?') > -1 ? '&' : '?') + queryString;
	},
};


    return URLBuilder;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.PathResolver = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of PathResolver class.
 *
 * @constructor
 */
function PathResolver() {}

PathResolver.prototype = {
	constructor: PathResolver,

	/**
     * Resolves the path of module.
     *
     * @param {string} root Root path which will be used as reference to resolve the path of the dependency.
     * @param {string} dependency The dependency path, which have to be resolved.
     * @return {string} The resolved dependency path.
     */
	resolvePath: function(root, dependency) {
		if (
			dependency === 'require' ||
			dependency === 'exports' ||
			dependency === 'module' ||
			!(dependency.indexOf('.') === 0 || dependency.indexOf('..') === 0)
		) {
			return dependency;
		}

		// Split module directories
		var moduleParts = root.split('/');
		// Remove module name
		moduleParts.splice(-1, 1);

		// Split dependency directories
		var dependencyParts = dependency.split('/');
		// Extract dependency name
		var dependencyName = dependencyParts.splice(-1, 1);

		for (var i = 0; i < dependencyParts.length; i++) {
			var dependencyPart = dependencyParts[i];

			if (dependencyPart === '.') {
				continue;
			} else if (dependencyPart === '..') {
				if (moduleParts.length) {
					moduleParts.splice(-1, 1);
				} else {
					moduleParts = moduleParts.concat(dependencyParts.slice(i));

					break;
				}
			} else {
				moduleParts.push(dependencyPart);
			}
		}

		moduleParts.push(dependencyName);

		return moduleParts.join('/');
	},
};


    return PathResolver;
}));
(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    /* jshint newcap:false */
    global.Loader = new built();
    global.require = global.Loader.require.bind(global.Loader);
    global.define = global.Loader.define.bind(global.Loader);
    global.define.amd = {};
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/* eslint-disable max-len,prefer-rest-params,no-extra-boolean-cast */

/**
 * Creates an instance of Loader class.
 *
 * @namespace Loader
 * @extends EventEmitter
 * @param {object=} config Configuration options
 * @constructor
 */
function Loader(config) {
	Loader.superclass.constructor.apply(this, arguments);

	this._config = config || global.__CONFIG__;

	this._modulesMap = {};
}

Loader.prototype = Object.create(global.EventEmitter.prototype);
Loader.prototype.constructor = Loader;
Loader.superclass = global.EventEmitter.prototype;

var LoaderProtoMethods = {
	/**
     * Adds a module to the configuration. See {@link ConfigParser#addModule} for more details.
     *
     * @memberof! Loader#
     * @param {Object} module The module which should be added to the configuration. See {@link ConfigParser#addModule} for more details.
     * @return {Object} Returns the added module to the configuration.
     */
	addModule: function(module) {
		return this._getConfigParser().addModule(module);
	},

	/**
     * Defines a module in the system and fires {@link Loader#event:moduleRegister} event with the registered module as param.
     *
     * @memberof! Loader#
     * @param {string} name The name of the module.
     * @param {array} dependencies List of module dependencies.
     * @param {function} implementation The implementation of the module.
     * @param {object=} config Object configuration:
     * <ul>
     *         <strong>Optional properties</strong>:
     *         <li>path (String) - Explicitly set path of the module. If omitted, module name will be used as path</li>
     *         <li>condition (Object) Object which represents if the module should be added automatically after another
     *             module.
     *         It should have the following properties:</li>
     *             <ul>
     *                 <li>trigger - the module, which should trigger the loading of the current module</li>
     *                 <li>test - function, which should return true if module should be loaded</li>
     *             </ul>
     *          <li>exports - If the module does not expose a "define" function, then you can specify an "exports" property.
     *              The value of this property should be a string, which represents the value, which this module exports to
     *              the global namespace. For example: exports: '_'. This will mean the module exports an underscore to the
     *              global namespace. In this way you can load legacy modules.
     *          </li>
     *     </ul>
     */
	define: function() {
		var self = this;

		var name = arguments[0];
		var dependencies = arguments[1];
		var implementation = arguments[2];
		var config = arguments[3] || {};

		void 0;

		config.anonymous = false;

		var passedArgsCount = arguments.length;

		if (passedArgsCount < 2) {
			void 0;
			implementation = arguments[0];
			dependencies = ['module', 'exports'];
			config.anonymous = true;
		} else if (passedArgsCount === 2) {
			if (typeof name === 'string') {
				void 0;
				// there are two parameters, but the first one is not an array with dependencies,
				// this is a module name
				dependencies = ['module', 'exports'];
				implementation = arguments[1];
			} else {
				void 0;
				dependencies = arguments[0];
				implementation = arguments[1];
				config.anonymous = true;
			}
		}

		if (config.anonymous) {
			// Postpone module's registration till the next scriptLoaded event
			var onScriptLoaded = function(loadedModules) {
				self.off('scriptLoaded', onScriptLoaded);

				if (loadedModules.length !== 1) {
					self._reportMismatchedAnonymousModules(
						implementation.toString()
					);
				} else {
					var moduleName = loadedModules[0];
					var module = self.getModules()[moduleName];

					if (module && module.pendingImplementation) {
						self._reportMismatchedAnonymousModules(
							implementation.toString()
						);
					}

					self._define(
						moduleName,
						dependencies,
						implementation,
						config
					);
				}
			};

			self.on('scriptLoaded', onScriptLoaded);
		} else {
			// This is not an anonymous module, go directly to module's registration flow
			this._define(name, dependencies, implementation, config);
		}
	},

	/**
     * Returns list of currently registered conditional modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered conditional modules.
     */
	getConditionalModules: function() {
		return this._getConfigParser().getConditionalModules();
	},

	/**
     * Returns list of currently registered modules.
     *
     * @memberof! Loader#
     * @return {array} List of currently registered modules.
     */
	getModules: function() {
		return this._getConfigParser().getModules();
	},

	/**
     * Requires list of modules. If a module is not yet registered, it will be ignored and its implementation
     * in the provided success callback will be left undefined.<br>
     *
     * @memberof! Loader#
     * @param {array|string[]} modules Modules can be specified as an array of strings or provided as
     *     multiple string parameters.
     * @param {function} success Callback, which will be invoked in case of success. The provided parameters will
     *     be implementations of all required modules.
     * @param {function} failure Callback, which will be invoked in case of failure. One parameter with
     *     information about the error will be provided.
     */
	require: function() {
		var self = this;

		void 0;

		var failureCallback;
		var i;
		var modules;
		var successCallback;

		// Modules can be specified by as an array, or just as parameters to the function
		// We do not slice or leak arguments to not cause V8 performance penalties
		// TODO: This could be extracted as an inline function (hint)
		if (Array.isArray(arguments[0])) {
			modules = arguments[0];
			successCallback = typeof arguments[1] === 'function'
				? arguments[1]
				: null;
			failureCallback = typeof arguments[2] === 'function'
				? arguments[2]
				: null;
		} else {
			modules = [];

			for (i = 0; i < arguments.length; ++i) {
				if (typeof arguments[i] === 'string') {
					modules[i] = arguments[i];

					/* istanbul ignore else */
				} else if (typeof arguments[i] === 'function') {
					successCallback = arguments[i];
					failureCallback = typeof arguments[++i] === 'function'
						? arguments[i]
						: /* istanbul ignore next */ null;

					break;
				}
			}
		}

		void 0;

		var configParser = self._getConfigParser();

		// Map the required modules so we start with clean idea what the hell we should load.
		var mappedModules = configParser.mapModule(modules);

		void 0;

		var rejectTimeout;

		new Promise(function(resolve, reject) {
			// Resolve the dependencies of the requested modules,
			// then load them and resolve the Promise
			self
				._resolveDependencies(mappedModules)
				.then(function(dependencies) {
					void 0;

					var config = configParser.getConfig();

					// Establish a load timeout and reject the Promise in case of Error
					if (config.waitTimeout !== 0) {
						rejectTimeout = setTimeout(function() {
							var registeredModules = configParser.getModules();

							var error = new Error(
								'Load timeout for modules: ' + modules
							);
							error.dependencies = dependencies;
							error.mappedModules = mappedModules;
							error.missingDependencies = dependencies.filter(
								function(dep) {
									return !registeredModules[dep]
										.implementation;
								}
							);
							error.modules = modules;

							// @deprecated: fill `dependecies` field to maintain
							// backward compatibility
							error.dependecies = error.dependencies;

							void 0;
							reject(error);
						}, config.waitTimeout || 7000);
					}

					// Load the dependencies, then resolve the Promise
					self._loadModules(dependencies).then(resolve, reject);
				}, reject);
		}).then(
			function(loadedModules) {
				void 0;
				clearTimeout(rejectTimeout);

				/* istanbul ignore else */
				if (successCallback) {
					var moduleImplementations = self._getModuleImplementations(
						mappedModules
					);
					successCallback.apply(
						successCallback,
						moduleImplementations
					);
				}
			},
			function(error) {
				void 0;
				clearTimeout(rejectTimeout);

				/* istanbul ignore else */
				if (failureCallback) {
					failureCallback.call(failureCallback, error);
				}
			}
		);
	},

	/**
     * Creates Promise for module. It will be resolved as soon as module is being loaded from server.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} moduleName The name of module for which Promise should be created.
     * @return {Promise} Promise, which will be resolved as soon as the requested module is being loaded.
     */
	_createModulePromise: function(moduleName) {
		var self = this;

		return new Promise(function(resolve, reject) {
			var registeredModules = self._getConfigParser().getModules();

			// Check if this is a module, which exports something
			// If so, check if the exported value is available
			var module = registeredModules[moduleName];

			if (module.exports) {
				var exportedValue = self._getValueGlobalNS(module.exports);

				if (!!exportedValue) {
					resolve(exportedValue);
				} else {
					var onScriptLoaded = function(loadedModules) {
						if (loadedModules.indexOf(moduleName) >= 0) {
							self.off('scriptLoaded', onScriptLoaded);

							var exportedValue = self._getValueGlobalNS(
								module.exports
							);

							if (!!exportedValue) {
								resolve(exportedValue);
							} else {
								reject(
									new Error(
										'Module ' +
											moduleName +
											' does not export the specified value: ' +
											module.exports
									)
								);
							}
						}
					};

					self.on('scriptLoaded', onScriptLoaded);
				}
			} else {
				var onModuleRegister = function(registeredModuleName) {
					if (registeredModuleName === moduleName) {
						self.off('moduleRegister', onModuleRegister);

						// Overwrite the promise entry in the modules map with a simple `true` value.
						// Hopefully GC will remove this promise from the memory.
						self._modulesMap[moduleName] = true;

						resolve(moduleName);
					}
				};

				self.on('moduleRegister', onModuleRegister);
			}
		});
	},

	/**
     * Defines a module in the system and fires {@link Loader#event:moduleRegister} event with the registered module as param.
     * Called internally by {@link Loader#define} method once it normalizes the passed arguments.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} name The name of the module.
     * @param {array} dependencies List of module dependencies.
     * @param {function} implementation The implementation of the module.
     * @param {object=} config See {@link Loader:define} for more details.
     */
	_define: function(name, dependencies, implementation, config) {
		// Create a new module by merging the provided config with the passed name,
		// dependencies and implementation.
		var module = config || {};
		var configParser = this._getConfigParser();

		var pathResolver = this._getPathResolver();

		// Resolve the path according to the parent module. Example:
		// define('metal/src/component/component', ['../array/array']) will become:
		// define('metal/src/component/component', ['metal/src/array/array'])
		dependencies = dependencies.map(function(dependency) {
			return pathResolver.resolvePath(name, dependency);
		});

		module.name = name;
		module.dependencies = dependencies;
		module.pendingImplementation = implementation;

		configParser.addModule(module);

		if (!this._modulesMap[module.name]) {
			this._modulesMap[module.name] = true;
		}

		this.emit('moduleRegister', name);
	},

	/**
     * Returns instance of {@link ConfigParser} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {ConfigParser} Instance of {@link ConfigParser} class.
     */
	_getConfigParser: function() {
		/* istanbul ignore else */
		if (!this._configParser) {
			this._configParser = new global.ConfigParser(this._config);
		}

		return this._configParser;
	},

	/**
     * Returns instance of {@link DependencyBuilder} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {DependencyBuilder} Instance of {@link DependencyBuilder} class.
     */
	_getDependencyBuilder: function() {
		if (!this._dependencyBuilder) {
			this._dependencyBuilder = new global.DependencyBuilder(
				this._getConfigParser()
			);
		}

		return this._dependencyBuilder;
	},

	/**
     * Retrieves a value from the global namespace.
     *
     * @memberof! Loader#
     * @protected
     * @param {String} exports The key which should be used to retrieve the value.
     * @return {Any} The retrieved value.
     */
	_getValueGlobalNS: function(exports) {
		var exportVariables = exports.split('.');

		var tmpVal = (0, eval)('this')[exportVariables[0]];

		for (var i = 1; tmpVal && i < exportVariables.length; i++) {
			if (
				Object.prototype.hasOwnProperty.call(tmpVal, exportVariables[i])
			) {
				tmpVal = tmpVal[exportVariables[i]];
			} else {
				return null;
			}
		}

		return tmpVal;
	},

	/**
     * Returns an array of all missing dependencies of the passed modules.
     * A missing dependency is a dependency, which does not have pending implementation yet.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} moduleNames List of module names to be checked for missing dependencies.
     * @return {Array<string>} A list with all missing dependencies.
     */
	_getMissingDependencies: function(moduleNames) {
		var configParser = this._getConfigParser();
		var registeredModules = configParser.getModules();

		var missingDependencies = Object.create(null);

		for (var i = 0; i < moduleNames.length; i++) {
			var module = registeredModules[moduleNames[i]];

			var mappedDependencies = configParser.mapModule(
				module.dependencies,
				module.map
			);

			for (var j = 0; j < mappedDependencies.length; j++) {
				var dependency = mappedDependencies[j];

				var dependencyModule = registeredModules[dependency];

				if (
					dependency !== 'require' &&
					dependency !== 'exports' &&
					dependency !== 'module' &&
					(!dependencyModule ||
						!dependencyModule.pendingImplementation)
				) {
					missingDependencies[dependency] = 1;
				}
			}
		}

		return Object.keys(missingDependencies);
	},

	/**
     * Retrieves module implementations to an array.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} requiredModules Lit of modules, which implementations will be added to an array.
     * @return {array} List of modules implementations.
     */
	_getModuleImplementations: function(requiredModules) {
		var moduleImplementations = [];

		var modules = this._getConfigParser().getModules();

		for (var i = 0; i < requiredModules.length; i++) {
			var requiredModule = modules[requiredModules[i]];

			moduleImplementations.push(
				requiredModule ? requiredModule.implementation : undefined
			);
		}

		return moduleImplementations;
	},

	/**
     * Returns an instance of {@link PathResolver} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {PathResolver} Instance of {@link PathResolver} class.
     */
	_getPathResolver: function() {
		if (!this._pathResolver) {
			this._pathResolver = new global.PathResolver();
		}

		return this._pathResolver;
	},

	/**
     * Returns instance of {@link URLBuilder} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {URLBuilder} Instance of {@link URLBuilder} class.
     */
	_getURLBuilder: function() {
		/* istanbul ignore else */
		if (!this._urlBuilder) {
			this._urlBuilder = new global.URLBuilder(this._getConfigParser());
		}

		return this._urlBuilder;
	},

	/**
     * Filters a list of modules and returns only these which don't have any of the provided list
     * of properties.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} moduleNames List of modules which which have to be filtered.
     * @param {string|Array} property The name of the property to filter by.
     * @return {array} List of modules matching the specified filter.
     */
	_filterModulesByProperty: function(moduleNames, property) {
		var properties = property;

		if (typeof property === 'string') {
			properties = [property];
		}

		var missingModules = [];

		var registeredModules = this._getConfigParser().getModules();

		for (var i = 0; i < moduleNames.length; i++) {
			var moduleName = moduleNames[i];

			var registeredModule = registeredModules[moduleNames[i]];

			if (!registeredModule) {
				missingModules.push(moduleName);
				continue;
			}

			// We exclude "require", "exports" and "module" modules, which are part of AMD spec.
			if (
				registeredModule === 'require' ||
				registeredModule === 'exports' ||
				registeredModule === 'module'
			) {
				continue;
			}

			for (var found = 0, j = 0; j < properties.length; j++) {
				if (registeredModule[properties[j]]) {
					found = true;
					break;
				}
			}

			if (!found) {
				missingModules.push(moduleName);
			}
		}

		return missingModules;
	},

	/**
     * Loads list of modules.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} moduleNames List of modules to be loaded.
     * @return {Promise} Promise, which will be resolved as soon as all module a being loaded.
     */
	_loadModules: function(moduleNames) {
		var self = this;

		return new Promise(function(resolve, reject) {
			// Get all modules without pending implementation or not yet requested
			var modulesForLoading = self._filterModulesByProperty(moduleNames, [
				'requested',
				'pendingImplementation',
			]);

			if (modulesForLoading.length) {
				// If there are modules, which have to be loaded, construct their URLs
				var modulesURL = self._getURLBuilder().build(modulesForLoading);

				var pendingScripts = [];

				// Create promises for each of the scripts, which should be loaded
				for (var i = 0; i < modulesURL.length; i++) {
					pendingScripts.push(self._loadScript(modulesURL[i]));
				}

				// Wait for resolving all script Promises
				// As soon as that happens, wait for each module to define itself

				void 0;
				Promise.all(pendingScripts)
					.then(function(loadedScripts) {
						return self._waitForModules(moduleNames);
					})
					// As soon as all scripts were loaded and all dependencies have been resolved,
					// resolve the main Promise
					.then(function(loadedModules) {
						resolve(loadedModules);
					})
					// If any script fails to load or other error happens,
					// reject the main Promise
					.catch(function(error) {
						reject(error);
					});
			} else {
				// If there are no any missing modules, just wait for modules dependencies
				// to be resolved and then resolve the main promise
				self
					._waitForModules(moduleNames)
					.then(function(loadedModules) {
						resolve(loadedModules);
					})
					// If some error happens, for example if some module implementation
					// throws error, reject the main Promise
					.catch(function(error) {
						reject(error);
					});
			}
		});
	},

	/**
     * Loads a script element on the page.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} modulesURL An Object with two properties:
     * - modules - List of the modules which should be loaded
     * - url - The URL from which the modules should be loaded
     * @return {Promise} Promise which will be resolved as soon as the script is being loaded.
     */
	_loadScript: function(modulesURL) {
		var self = this;

		return new Promise(function(resolve, reject) {
			var script = document.createElement('script');

			script.src = modulesURL.url;

			// On ready state change is needed for IE < 9, not sure if that is needed anymore,
			// it depends which browsers will we support at the end
			script.onload = script.onreadystatechange = function() {
				/* istanbul ignore else */
				if (
					!this.readyState ||
					/* istanbul ignore next */ this.readyState === 'complete' ||
					/* istanbul ignore next */ this.readyState === 'load'
				) {
					script.onload = script.onreadystatechange = null;

					resolve(script);

					self.emit('scriptLoaded', modulesURL.modules);
				}
			};

			// If some script fails to load, reject the main Promise
			script.onerror = function() {
				document.head.removeChild(script);

				reject(script);
			};

			document.head.appendChild(script);
		});
	},

	/**
     * Resolves modules dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {Promise} Promise which will be resolved as soon as all dependencies are being resolved.
     */
	_resolveDependencies: function(modules) {
		var self = this;

		return new Promise(function(resolve, reject) {
			try {
				var dependencies = self
					._getDependencyBuilder()
					.resolveDependencies(modules);

				resolve(dependencies);
			} catch (error) {
				reject(error);
			}
		});
	},

	/**
     * Reports a mismatched anonymous module error. Depending on the value of the configuration property
     * `__CONFIG__.reportMismatchedAnonymousModules`, this method will throw an error, use the console[level]
     * method to log the message or silently ignore it.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} msg Additional information to log with the error.
     */
	_reportMismatchedAnonymousModules: function(msg) {
		var errorMessage = 'Mismatched anonymous define() module: ' + msg;
		var reportLevel = this._config.reportMismatchedAnonymousModules;

		if (!reportLevel || reportLevel === 'exception') {
			throw new Error(errorMessage);
		} else if (console && console[reportLevel]) {
			// Call console's method by using the `call` function
			// to prevent stripDebug to remove the statement in production
			console[reportLevel].call(console, errorMessage);
		}
	},

	/**
     * Invokes the implementation method of list of modules passing the implementations of its dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to which implementation should be set.
     */
	_setModuleImplementation: function(modules) {
		var self = this;
		var registeredModules = this._getConfigParser().getModules();

		for (var i = 0; i < modules.length; i++) {
			var module = modules[i];

			if (module.implementation) {
				continue;
			} else if (module.exports) {
				module.pendingImplementation = module.implementation = this._getValueGlobalNS(
					module.exports
				);
				continue;
			}

			var dependencyImplementations = [];

			// Leave exports implementation undefined by default
			var exportsImpl;
			var configParser = this._getConfigParser();
			var pathResolver = this._getPathResolver();

			for (var j = 0; j < module.dependencies.length; j++) {
				var dependency = module.dependencies[j];

				// If the current dependency of this module is 'exports',
				// create an empty object and pass it as implementation of
				// 'exports' module
				if (dependency === 'exports') {
					exportsImpl = {};

					dependencyImplementations.push(exportsImpl);
				} else if (dependency === 'module') {
					exportsImpl = { exports: {} };

					dependencyImplementations.push(exportsImpl);
				} else if (dependency === 'require') {
					var localRequire = function(moduleName) {
						var argc = arguments.length;

						if (argc > 1) {
							global.require.apply(global.Loader, arguments);
						} else {
							moduleName = pathResolver.resolvePath(
								module.name,
								moduleName
							);

							moduleName = configParser.mapModule(
								moduleName,
								module.map
							);

							var dependencyModule = configParser.getModules()[
								moduleName
							];

							if (
								!dependencyModule ||
								!dependencyModule.implementation
							) {
								throw new Error(
									'Module "' +
										moduleName +
										'" has not been loaded yet for context: ' +
										module.name
								);
							}

							return dependencyModule.implementation;
						}
					};

					localRequire.toUrl = function(moduleName) {
						var moduleURLs = self
							._getURLBuilder()
							.build([moduleName]);

						return moduleURLs[0].url;
					};

					dependencyImplementations.push(localRequire);
				} else {
					// otherwise set as value the implementation of the registered module
					var dependencyModule =
						registeredModules[
							configParser.mapModule(dependency, module.map)
						];

					var impl = dependencyModule.implementation;

					dependencyImplementations.push(impl);
				}
			}

			var result;

			if (typeof module.pendingImplementation === 'function') {
				result = module.pendingImplementation.apply(
					module.pendingImplementation,
					dependencyImplementations
				);
			} else {
				result = module.pendingImplementation;
			}

			// Store as implementation either the returned value from the function's invocation,
			// or one of these:
			// 1. If the passed object has 'exports' property (in case of 'module' dependency), get this one.
			// 2. Otherwise, get the passed object itself (in case of 'exports' dependency)
			//
			// The final implementation of this module may be undefined if there is no
			// returned value, or the object does not have 'exports' or 'module' dependency.
			if (result) {
				module.implementation = result;
			} else if (exportsImpl) {
				module.implementation = exportsImpl.exports || exportsImpl;
			}
		}
	},

	/**
     * Resolves a Promise as soon as all module dependencies are being resolved or it has implementation already.
     *
     * @memberof! Loader#
     * @protected
     * @param {Object} moduleName The module for which this function should wait.
     * @return {Promise}
     */
	_waitForModule: function(moduleName) {
		var self = this;

		// Check if there is already a promise for this module.
		// If there is not - create one and store it to module promises map.
		var modulePromise = self._modulesMap[moduleName];

		if (!modulePromise) {
			modulePromise = self._createModulePromise(moduleName);

			self._modulesMap[moduleName] = modulePromise;
		}

		return modulePromise;
	},

	/**
     * Resolves a Promise as soon as all dependencies of all provided modules are being resolved and modules have
     * implementations.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} moduleNames List of modules for which implementations this function should wait.
     * @return {Promise}
     */
	_waitForModules: function(moduleNames) {
		var self = this;

		return new Promise(function(resolve, reject) {
			var modulesPromises = [];

			for (var i = 0; i < moduleNames.length; i++) {
				modulesPromises.push(self._waitForModule(moduleNames[i]));
			}

			// Wait until all modules were loaded and their Promises resolved
			Promise.all(modulesPromises).then(function(uselessPromises) {
				// The modules were loaded. However, we have to check their dependencies
				// one more time, because some dependencies might have not been registered in the configuration.
				// In this case we have to load them too, otherwise we won't be able to properly
				// get the implementation from the module.
				var registeredModules = self._getConfigParser().getModules();

				var defineModules = function() {
					var definedModules = [];

					for (var i = 0; i < moduleNames.length; i++) {
						definedModules.push(registeredModules[moduleNames[i]]);
					}

					self._setModuleImplementation(definedModules);

					resolve(definedModules);
				};

				var missingDependencies = self._getMissingDependencies(
					moduleNames
				);

				if (missingDependencies.length) {
					void 0;
					self.require(missingDependencies, defineModules, reject);
				} else {
					defineModules();
				}
			}, reject);
		});
	},

	/**
     * Indicates that a module has been registered.
     *
     * @event Loader#moduleRegister
     * @param {Object} module - The registered module.
     */
};

Object.keys(LoaderProtoMethods).forEach(function(key) {
	Loader.prototype[key] = LoaderProtoMethods[key];
});

Loader.prototype.define.amd = {};


    return Loader;
}));

	var namespace = null;
	var exposeGlobal = true;

	if (typeof global.__CONFIG__ === 'object') {
		if (typeof global.__CONFIG__.namespace === 'string') {
			namespace = global.__CONFIG__.namespace;
		}

		if (typeof global.__CONFIG__.exposeGlobal === 'boolean') {
			exposeGlobal = global.__CONFIG__.exposeGlobal;
		}
	}

	if (namespace) {
		var ns = window[global.__CONFIG__.namespace] ? window[global.__CONFIG__.namespace] : {};
		ns.Loader = global.Loader;
		window[global.__CONFIG__.namespace] = ns;
	} else {
		window.Loader = global.Loader;
	}

	if (exposeGlobal) {
		window.Loader = global.Loader;
		window.require = global.require;
		window.define = global.define;
	}

	global.Loader.version = function() { return '1.6.0' };
}());