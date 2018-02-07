import ConfigParser from './config-parser';
import DependencyBuilder from './dependency-builder';
import EventEmitter from './event-emitter';
import PathResolver from './path-resolver';
import URLBuilder from './url-builder';
import packageJson from '../../package.json';

/**
 *
 */
export default class Loader extends EventEmitter {
	/**
	 * Creates an instance of Loader class.
	 *
	 * @namespace Loader
	 * @extends EventEmitter
	 * @param {object=} config Configuration options (defaults to window.__CONFIG__)
	 * @param {object} document DOM document object to use (defaults to window.document)
	 * @constructor
	 */
	constructor(config = null, document = null) {
		super();

		this._config = config || window.__CONFIG__;
		this._document = document || window.document;
		this._modulesMap = {};
	}

	/**
	 * Get loader version
	 * @return {String} the version number as specified in package.json
	 */
	version() {
		return packageJson.version;
	}

	/**
	 * Adds a module to the configuration. See {@link ConfigParser#addModule}
	 * for more details.
	 *
	 * @memberof! Loader#
	 * @param {Object} module The module which should be added to the configuration. See {@link ConfigParser#addModule}
	 *  						for more details.
	 * @return {Object} Returns the added module to the configuration.
	 */
	addModule(module) {
		return this._getConfigParser().addModule(module);
	}

	/**
	 * Defines a module in the system and fires {@link Loader#event:moduleRegister} event with the registered module as
	 * param.
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
	 *         							module. It should have the following properties:
	 *         </li>
	 *             <ul>
	 *                 <li>trigger - the module, which should trigger the loading of the current module</li>
	 *                 <li>test - function, which should return true if module should be loaded</li>
	 *             </ul>
	 *          <li>exports - If the module does not expose a "define" function, then you can specify an "exports"
	 *          				property. The value of this property should be a string, which represents the value,
	 *          				which this module exports to the global namespace. For example: exports: '_'. This will
	 *          				mean the module exports an underscore to the global namespace. In this way you can load
	 *          				legacy modules.
	 *          </li>
	 *     </ul>
	 */
	define(...args) {
		let name = args[0];
		let dependencies = args[1];
		let implementation = args[2];
		let config = args[3] || {};

		console.log('DEFINE', name, dependencies);

		config.anonymous = false;

		let passedArgsCount = arguments.length;

		if (passedArgsCount < 2) {
			console.log(
				'DEFINE, module with one param only, this should be anonymous module'
			);
			implementation = args[0];
			dependencies = ['module', 'exports'];
			config.anonymous = true;
		} else if (passedArgsCount === 2) {
			if (typeof name === 'string') {
				console.log(
					'DEFINE, module with two params only, name and implementation',
					name
				);
				// there are two parameters, but the first one is not an array with dependencies,
				// this is a module name
				dependencies = ['module', 'exports'];
				implementation = args[1];
			} else {
				console.log(
					'DEFINE, module with two params only - dependencies and implementation, anonymous module'
				);
				dependencies = args[0];
				implementation = args[1];
				config.anonymous = true;
			}
		}
		/* eslint-enable prefer-rest-params */

		if (config.anonymous) {
			// Postpone module's registration till the next scriptLoaded event
			const onScriptLoaded = loadedModules => {
				this.off('scriptLoaded', onScriptLoaded);

				if (loadedModules.length !== 1) {
					this._reportMismatchedAnonymousModules(
						implementation.toString()
					);
				} else {
					let moduleName = loadedModules[0];
					let module = this.getModules()[moduleName];

					if (module && module.pendingImplementation) {
						this._reportMismatchedAnonymousModules(
							implementation.toString()
						);
					}

					this._define(
						moduleName,
						dependencies,
						implementation,
						config
					);
				}
			};

			this.on('scriptLoaded', onScriptLoaded);
		} else {
			// This is not an anonymous module, go directly to module's
			// registration flow
			this._define(name, dependencies, implementation, config);
		}
	}

	/**
	 * Returns list of currently registered conditional modules.
	 *
	 * @memberof! Loader#
	 * @return {array} List of currently registered conditional modules.
	 */
	getConditionalModules() {
		return this._getConfigParser().getConditionalModules();
	}

	/**
	 * Returns list of currently registered modules.
	 *
	 * @memberof! Loader#
	 * @return {array} List of currently registered modules.
	 */
	getModules() {
		return this._getConfigParser().getModules();
	}

	/**
	 * Requires list of modules. If a module is not yet registered, it will be
	 * ignored and its implementation in the provided success callback will be
	 * left undefined.
	 *
	 * @memberof! Loader#
	 * @param {array|string[]} modules Modules can be specified as an array of
	 * 									strings or provided as multiple string
	 * 									parameters.
	 * @param {function} success Callback, which will be invoked in case of
	 * 								success. The provided parameters will be
	 * 								implementations of all required modules.
	 * @param {function} failure Callback, which will be invoked in case of
	 * 								failure. One parameter with information
	 * 								about the error will be provided.
	 */
	require() {
		console.log('REQUIRE CALLED');

		let failureCallback;
		let i;
		let modules;
		let successCallback;

		// Modules can be specified by as an array, or just as parameters to the
		// function. We do not slice or leak arguments to not cause V8
		// performance penalties.
		// TODO: This could be extracted as an inline function (hint)
		/* eslint-disable prefer-rest-params */
		if (Array.isArray(arguments[0])) {
			modules = arguments[0];
			successCallback =
				typeof arguments[1] === 'function' ? arguments[1] : null;
			failureCallback =
				typeof arguments[2] === 'function' ? arguments[2] : null;
		} else {
			modules = [];

			for (i = 0; i < arguments.length; ++i) {
				if (typeof arguments[i] === 'string') {
					modules[i] = arguments[i];

					/* istanbul ignore else */
				} else if (typeof arguments[i] === 'function') {
					successCallback = arguments[i];
					failureCallback =
						typeof arguments[++i] === 'function'
							? arguments[i]
							: /* istanbul ignore next */ null;

					break;
				}
			}
		}
		/* eslint-enable prefer-rest-params */

		console.log('REQUIRE called with', modules);

		let configParser = this._getConfigParser();

		// Map the required modules so we start with clean idea what the hell we
		// should load.
		let mappedModules = configParser.mapModule(modules);

		console.log('REQUIRE modules mapped to', mappedModules);

		let rejectTimeout;

		new Promise((resolve, reject) => {
			// Resolve the dependencies of the requested modules,
			// then load them and resolve the Promise
			this._resolveDependencies(mappedModules).then(dependencies => {
				console.log('REQUIRE dependencies resolved to', dependencies);

				this._log(
					'Resolved modules:',
					mappedModules,
					'to:',
					dependencies
				);

				let dependencyErrors = dependencies
					.filter(dep => dep.indexOf(':ERROR:') === 0)
					.map(dep => dep.substr(7));

				if (dependencyErrors.length > 0) {
					reject(
						new Error(
							'The following problems where detected while ' +
								'resolving modules:\n' +
								dependencyErrors.join('\n')
						)
					);
				}

				let config = configParser.getConfig();

				// Establish a load timeout and reject the Promise in case
				// of Error
				if (config.waitTimeout !== 0) {
					rejectTimeout = setTimeout(() => {
						let registeredModules = configParser.getModules();

						let error = new Error(
							'Load timeout for modules: ' + modules
						);
						error.dependencies = dependencies;
						error.mappedModules = mappedModules;
						error.missingDependencies = dependencies.filter(
							dep =>
								typeof registeredModules[dep].implementation ===
								'undefined'
						);
						error.modules = modules;

						// @deprecated: fill `dependecies` field to maintain
						// backward compatibility
						error.dependecies = error.dependencies;

						console.log('REQUIRE timeout', error);
						reject(error);
					}, config.waitTimeout || 7000);
				}

				// Load the dependencies, then resolve the Promise
				this._loadModules(dependencies).then(resolve, reject);
			}, reject);
		}).then(
			() => {
				console.log('REQUIRE promise success');
				clearTimeout(rejectTimeout);

				/* istanbul ignore else */
				if (successCallback) {
					let moduleImplementations = this._getModuleImplementations(
						mappedModules
					);
					successCallback.apply(
						successCallback,
						moduleImplementations
					);
				}
			},
			error => {
				console.log('REQUIRE promise failure');
				clearTimeout(rejectTimeout);

				/* istanbul ignore else */
				if (failureCallback) {
					failureCallback.call(failureCallback, error);
				} else {
					this._error(
						'Unhandled failure:',
						error,
						'while resolving modules:',
						mappedModules
					);
				}
			}
		);
	}

	/**
	 * Creates Promise for module. It will be resolved as soon as module is
	 * being loaded from server.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {string} moduleName The name of module for which Promise should
	 * 						be created.
	 * @return {Promise} Promise, which will be resolved as soon as the
	 * 						requested module is being loaded.
	 */
	_createModulePromise(moduleName) {
		return new Promise((resolve, reject) => {
			let registeredModules = this._getConfigParser().getModules();

			// Check if this is a module, which exports something
			// If so, check if the exported value is available
			let module = registeredModules[moduleName];

			if (module.exports) {
				let exportedValue = this._getValueGlobalNS(module.exports);

				if (exportedValue) {
					resolve(exportedValue);
				} else {
					const onScriptLoaded = loadedModules => {
						if (loadedModules.indexOf(moduleName) >= 0) {
							this.off('scriptLoaded', onScriptLoaded);

							let exportedValue = this._getValueGlobalNS(
								module.exports
							);

							if (exportedValue) {
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

					this.on('scriptLoaded', onScriptLoaded);
				}
			} else {
				const onModuleRegister = registeredModuleName => {
					if (registeredModuleName === moduleName) {
						this.off('moduleRegister', onModuleRegister);

						// Overwrite the promise entry in the modules map with a simple `true` value.
						// Hopefully GC will remove this promise from the memory.
						this._modulesMap[moduleName] = true;

						resolve(moduleName);
					}
				};

				this.on('moduleRegister', onModuleRegister);
			}
		});
	}

	/**
	 * Defines a module in the system and fires
	 * {@link Loader#event:moduleRegister} event with the registered module as
	 * param. Called internally by {@link Loader#define} method once it
	 * normalizes the passed arguments.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {string} name The name of the module.
	 * @param {array} dependencies List of module dependencies.
	 * @param {function} implementation The implementation of the module.
	 * @param {object=} config See {@link Loader:define} for more details.
	 */
	_define(name, dependencies, implementation, config) {
		// Create a new module by merging the provided config with the passed
		// name, dependencies and implementation.
		let module = config || {};
		let configParser = this._getConfigParser();

		if (configParser.getConfig().ignoreModuleVersion) {
			let nameParts = name.split('/');
			let packageParts = nameParts[0].split('@');

			nameParts[0] = packageParts[0];

			name = nameParts.join('/');
		}

		let pathResolver = this._getPathResolver();

		// Resolve the path according to the parent module. Example:
		// 	define('metal/src/component/component', ['../array/array'])
		// will become:
		// 	define('metal/src/component/component', ['metal/src/array/array'])
		dependencies = dependencies.map(dependency =>
			pathResolver.resolvePath(name, dependency)
		);

		module.name = name;
		module.dependencies = dependencies;
		module.pendingImplementation = implementation;

		configParser.addModule(module);

		if (!this._modulesMap[module.name]) {
			this._modulesMap[module.name] = true;
		}

		this.emit('moduleRegister', name);
	}

	/**
	 * Returns instance of {@link ConfigParser} class.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @return {ConfigParser} Instance of {@link ConfigParser} class.
	 */
	_getConfigParser() {
		/* istanbul ignore else */
		if (!this._configParser) {
			this._configParser = new ConfigParser(this._config);
		}

		return this._configParser;
	}

	/**
	 * Returns instance of {@link DependencyBuilder} class.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @return {DependencyBuilder} Instance of {@link DependencyBuilder} class.
	 */
	_getDependencyBuilder() {
		if (!this._dependencyBuilder) {
			this._dependencyBuilder = new DependencyBuilder(
				this._getConfigParser()
			);
		}

		return this._dependencyBuilder;
	}

	/**
	 * Retrieves a value from the global namespace.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {String} exports The key which should be used to retrieve the
	 * 							value.
	 * @return {Any} The retrieved value.
	 */
	_getValueGlobalNS(exports) {
		let exportVariables = exports.split('.');

		let tmpVal = (0, eval)('this')[exportVariables[0]];

		for (let i = 1; tmpVal && i < exportVariables.length; i++) {
			if (
				Object.prototype.hasOwnProperty.call(tmpVal, exportVariables[i])
			) {
				tmpVal = tmpVal[exportVariables[i]];
			} else {
				return null;
			}
		}

		return tmpVal;
	}

	/**
	 * Returns an array of all missing dependencies of the passed modules.
	 * A missing dependency is a dependency, which does not have pending
	 * implementation yet.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} moduleNames List of module names to be checked for missing
	 * 								dependencies.
	 * @return {Array<string>} A list with all missing dependencies.
	 */
	_getMissingDependencies(moduleNames) {
		let configParser = this._getConfigParser();
		let registeredModules = configParser.getModules();

		let missingDependencies = Object.create(null);

		for (let i = 0; i < moduleNames.length; i++) {
			let module = registeredModules[moduleNames[i]];

			let mappedDependencies = configParser.mapModule(
				module.dependencies,
				module.map
			);

			for (let j = 0; j < mappedDependencies.length; j++) {
				let dependency = mappedDependencies[j];

				let dependencyModule = registeredModules[dependency];

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
	}

	/**
	 * Retrieves module implementations to an array.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} requiredModules List of modules, which implementations
	 * 					will be added to an array.
	 * @return {array} List of modules implementations.
	 */
	_getModuleImplementations(requiredModules) {
		let moduleImplementations = [];

		let modules = this._getConfigParser().getModules();

		for (let i = 0; i < requiredModules.length; i++) {
			let requiredModule = modules[requiredModules[i]];

			moduleImplementations.push(
				requiredModule ? requiredModule.implementation : undefined
			);
		}

		return moduleImplementations;
	}

	/**
	 * Returns an instance of {@link PathResolver} class.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @return {PathResolver} Instance of {@link PathResolver} class.
	 */
	_getPathResolver() {
		if (!this._pathResolver) {
			this._pathResolver = new PathResolver();
		}

		return this._pathResolver;
	}

	/**
	 * Returns instance of {@link URLBuilder} class.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @return {URLBuilder} Instance of {@link URLBuilder} class.
	 */
	_getURLBuilder() {
		/* istanbul ignore else */
		if (!this._urlBuilder) {
			this._urlBuilder = new URLBuilder(this._getConfigParser());
		}

		return this._urlBuilder;
	}

	/**
	 * Filters a list of modules and returns only these which don't have any of
	 * the provided list of properties.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} moduleNames List of modules which which have to be
	 * 						filtered.
	 * @param {string|Array} property The name of the property to filter by.
	 * @return {array} List of modules matching the specified filter.
	 */
	_filterModulesByProperty(moduleNames, property) {
		let properties = property;

		if (typeof property === 'string') {
			properties = [property];
		}

		let missingModules = [];

		let registeredModules = this._getConfigParser().getModules();

		for (let i = 0; i < moduleNames.length; i++) {
			let moduleName = moduleNames[i];

			let registeredModule = registeredModules[moduleNames[i]];

			if (!registeredModule) {
				missingModules.push(moduleName);
				continue;
			}

			// We exclude "require", "exports" and "module" modules, which are
			// part of AMD spec.
			if (
				registeredModule === 'require' ||
				registeredModule === 'exports' ||
				registeredModule === 'module'
			) {
				continue;
			}

			let found = false;

			for (let j = 0; j < properties.length; j++) {
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
	}

	/**
	 * Loads list of modules.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} moduleNames List of modules to be loaded.
	 * @return {Promise} Promise, which will be resolved as soon as all module a
	 * 						being loaded.
	 */
	_loadModules(moduleNames) {
		return new Promise((resolve, reject) => {
			// Get all modules without pending implementation or not yet
			// requested
			let modulesForLoading = this._filterModulesByProperty(moduleNames, [
				'requested',
				'pendingImplementation',
			]);

			if (modulesForLoading.length) {
				// If there are modules, which have to be loaded, construct
				// their URLs
				let modulesURL = this._getURLBuilder().build(modulesForLoading);

				let pendingScripts = [];

				// Create promises for each of the scripts, which should be
				// loaded
				for (let i = 0; i < modulesURL.length; i++) {
					pendingScripts.push(this._loadScript(modulesURL[i]));
				}

				// Wait for resolving all script Promises
				// As soon as that happens, wait for each module to define
				// itself

				console.log('SCRIPTS', modulesURL);
				Promise.all(pendingScripts)
					.then(() => this._waitForModules(moduleNames))
					// As soon as all scripts were loaded and all dependencies
					// have been resolved, resolve the main Promise
					.then(resolve)
					// If any script fails to load or other error happens,
					// reject the main Promise
					.catch(reject);
			} else {
				// If there are no any missing modules, just wait for modules dependencies
				// to be resolved and then resolve the main promise
				this._waitForModules(moduleNames)
					.then(resolve)
					// If some error happens, for example if some module implementation
					// throws error, reject the main Promise
					.catch(reject);
			}
		});
	}

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
	_loadScript(modulesURL) {
		let self = this;

		return new Promise((resolve, reject) => {
			let script = this._document.createElement('script');

			script.src = modulesURL.url;
			script.async = false;

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
			script.onerror = () => {
				this._document.head.removeChild(script);

				reject(script);
			};

			this._document.head.appendChild(script);
		});
	}

	/**
	 * Show a message in console if the explainResolutions option is active.
	 *
	 * @param  {Array} msgs the objects to be printed
	 * @return {void}
	 */
	_log(...msgs) {
		let aliasedConsole = console;
		let args = arguments.length === 1 ? [msgs[0]] : Array(...msgs);
		let config = this._getConfigParser().getConfig();

		if (config.explainResolutions) {
			aliasedConsole.log(...['Liferay AMD Loader:'].concat(args));
		}
	}

	/**
	 * Report errors to the console even in non-debug versions of the loader.
	 *
	 * @param  {Array} msgs the objects to be printed
	 * @return {void}
	 */
	_error(...msgs) {
		let aliasedConsole = console;
		let args = msgs.length === 1 ? [msgs[0]] : Array(...msgs);

		aliasedConsole.log(...['Liferay AMD Loader:'].concat(args));
	}

	/**
	 * Resolves modules dependencies.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} modules List of modules which dependencies should be resolved.
	 * @return {Promise} Promise which will be resolved as soon as all dependencies are being resolved.
	 */
	_resolveDependencies(modules) {
		return new Promise((resolve, reject) => {
			try {
				const dependencyBuilder = this._getDependencyBuilder();

				resolve(dependencyBuilder.resolveDependencies(modules));
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Reports a mismatched anonymous module error. Depending on the value of the configuration property
	 * `__CONFIG__.reportMismatchedAnonymousModules`, this method will throw an error, use the console[level]
	 * method to log the message or silently ignore it.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {string} msg Additional information to log with the error.
	 */
	_reportMismatchedAnonymousModules(msg) {
		let errorMessage = 'Mismatched anonymous define() module: ' + msg;
		let reportLevel = this._config.reportMismatchedAnonymousModules;

		if (!reportLevel || reportLevel === 'exception') {
			throw new Error(errorMessage);
		} else if (console && console[reportLevel]) {
			// Call console's method by using the `call` function
			// to prevent stripDebug to remove the statement in production
			console[reportLevel].call(console, errorMessage);
		}
	}

	/**
	 * Invokes the implementation method of list of modules passing the implementations of its dependencies.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} modules List of modules to which implementation should be set.
	 */
	_setModuleImplementation(modules) {
		let registeredModules = this._getConfigParser().getModules();

		for (let i = 0; i < modules.length; i++) {
			let module = modules[i];

			if (typeof module.implementation !== 'undefined') {
				continue;
			} else if (typeof module.exports !== 'undefined') {
				module.implementation = this._getValueGlobalNS(module.exports);
				module.pendingImplementation = module.implementation;
				continue;
			}

			let dependencyImplementations = [];

			// Leave exports implementation undefined by default
			let moduleImpl = {exports: {}};
			let configParser = this._getConfigParser();

			for (let j = 0; j < module.dependencies.length; j++) {
				let dependency = module.dependencies[j];

				// If the current dependency of this module is 'exports',
				// create an empty object and pass it as implementation of
				// 'exports' module
				if (dependency === 'exports') {
					dependencyImplementations.push(moduleImpl.exports);
				} else if (dependency === 'module') {
					dependencyImplementations.push(moduleImpl);
				} else if (dependency === 'require') {
					let localRequire = this._createLocalRequire(module);

					localRequire.toUrl = moduleName => {
						let moduleURLs = this._getURLBuilder().build([
							moduleName,
						]);

						return moduleURLs[0].url;
					};

					dependencyImplementations.push(localRequire);
				} else {
					// otherwise set as value the implementation of the registered module
					let dependencyModule =
						registeredModules[
							configParser.mapModule(dependency, module.map)
						];

					let impl = dependencyModule.implementation;

					dependencyImplementations.push(impl);
				}
			}

			let result;

			if (typeof module.pendingImplementation === 'function') {
				result = module.pendingImplementation.apply(
					module.pendingImplementation,
					dependencyImplementations
				);
			} else {
				result = module.pendingImplementation;
			}

			// Store as implementation either the returned value from the
			// function's invocation, or the value inside module.exports magic
			// dependency.
			//
			// The final implementation of this module may be {} if there is no
			// returned value, or the object does not assign anything to
			// module.exports.
			if (typeof result !== 'undefined') {
				module.implementation = result;
			} else {
				module.implementation = moduleImpl.exports;
			}
		}
	}

	/**
	 * Create a function implementing the local require method of the AMD specification.
	 * @param  {Object} module a module descriptor
	 * @return {function} the local require implementation for the given module
	 */
	_createLocalRequire(module) {
		let configParser = this._getConfigParser();
		let pathResolver = this._getPathResolver();

		return (moduleName, ...rest) => {
			if (rest.length > 0) {
				return this.require(moduleName, ...rest);
			} else {
				moduleName = pathResolver.resolvePath(module.name, moduleName);

				moduleName = configParser.mapModule(moduleName, module.map);

				let dependencyModule = configParser.getModules()[moduleName];

				if (
					!dependencyModule ||
					typeof dependencyModule.implementation === 'undefined'
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
	}

	/**
	 * Resolves a Promise as soon as all module dependencies are being resolved or it has implementation already.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {Object} moduleName The module for which this function should wait.
	 * @return {Promise}
	 */
	_waitForModule(moduleName) {
		// Check if there is already a promise for this module.
		// If there is not - create one and store it to module promises map.
		let modulePromise = this._modulesMap[moduleName];

		if (!modulePromise) {
			modulePromise = this._createModulePromise(moduleName);

			this._modulesMap[moduleName] = modulePromise;
		}

		return modulePromise;
	}

	/**
	 * Resolves a Promise as soon as all dependencies of all provided modules are being resolved and modules have
	 * implementations.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} moduleNames List of modules for which implementations this function should wait.
	 * @return {Promise}
	 */
	_waitForModules(moduleNames) {
		return new Promise((resolve, reject) => {
			let modulesPromises = [];

			for (let i = 0; i < moduleNames.length; i++) {
				modulesPromises.push(this._waitForModule(moduleNames[i]));
			}

			// Wait until all modules were loaded and their Promises resolved
			Promise.all(modulesPromises).then(() => {
				// The modules were loaded. However, we have to check their dependencies
				// one more time, because some dependencies might have not been registered in the configuration.
				// In this case we have to load them too, otherwise we won't be able to properly
				// get the implementation from the module.
				let registeredModules = this._getConfigParser().getModules();

				let defineModules = () => {
					let definedModules = [];

					for (let i = 0; i < moduleNames.length; i++) {
						definedModules.push(registeredModules[moduleNames[i]]);
					}

					this._setModuleImplementation(definedModules);

					resolve(definedModules);
				};

				let missingDependencies = this._getMissingDependencies(
					moduleNames
				);

				if (missingDependencies.length) {
					console.log(
						'MISSING DEPENDENCIES',
						'requested',
						moduleNames,
						'missing',
						missingDependencies
					);
					this.require(missingDependencies, defineModules, reject);
				} else {
					defineModules();
				}
			}, reject);
		});
	}

	/**
	 * Indicates that a module has been registered.
	 *
	 * @event Loader#moduleRegister
	 * @param {Object} module - The registered module.
	 */
}

Loader.prototype.define.amd = {};
