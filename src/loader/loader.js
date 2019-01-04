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
	require(...args) {
		console.log('REQUIRE CALLED');

		const {
			modules,
			successCallback,
			failureCallback,
		} = this._normalizeRequireArgs(args);

		console.log('REQUIRE called with', modules);
		let rejectTimeout;

		new Promise((resolve, reject) => {
			const dependencyBuilder = this._getDependencyBuilder();

			dependencyBuilder.resolveDependencies(modules).then(resolved => {
				let dependencies = resolved.resolvedModules;
				let modulesMap = resolved.modulesMap;
				let configMap = resolved.configMap;
				let pathMap = resolved.pathMap;

				let configParser = this._getConfigParser();

				for (let alias in modulesMap) {
					if ({}.hasOwnProperty.call(modulesMap, alias)) {
						let moduleMap = {
							name: alias,
							map: modulesMap[alias],
						};

						configParser.addModule(moduleMap);
					}
				}

				configParser._config.maps = Object.assign(
					{}, configParser._config.maps, configMap);

				configParser._config.paths = Object.assign(
					{}, configParser._config.paths, pathMap);

				this._log(
					'Resolved modules:',
					modules,
					'to:',
					dependencies
				);

				const resolutionError = this._getResolutionError(dependencies);

				if (resolutionError) {
					reject(resolutionError);

					return;
				}

				rejectTimeout = this._setRejectTimeout(
					modules,
					modules,
					dependencies,
					reject
				);

				this._loadModules(dependencies).then(resolve, reject);
			}, reject);
		}).then(
			() => {
				console.log('REQUIRE promise success');
				clearTimeout(rejectTimeout);

				/* istanbul ignore else */
				if (successCallback) {
					let moduleImplementations;

					moduleImplementations = this._getModuleImplementations(
						modules
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
						modules
					);
				}
			}
		);
	}

	/**
	 * Extract the three nominal arguments (modules, successCallback, and
	 * failureCallback) of a require call from the arguments array.
	 * @param  {Array} args the arguments array of the require call
	 * @return {Object} an object with three fields: modules, successCallback,
	 * 					and failureCallback,
	 */
	_normalizeRequireArgs(args) {
		let modules;
		let successCallback;
		let failureCallback;

		// Modules can be specified by as an array, or just as parameters to the
		// function. We do not slice or leak arguments to not cause V8
		// performance penalties.
		if (Array.isArray(args[0])) {
			modules = args[0];
			successCallback = typeof args[1] === 'function' ? args[1] : null;
			failureCallback = typeof args[2] === 'function' ? args[2] : null;
		} else {
			modules = [];

			for (let i = 0; i < args.length; ++i) {
				if (typeof args[i] === 'string') {
					modules[i] = args[i];

					/* istanbul ignore else */
				} else if (typeof args[i] === 'function') {
					successCallback = args[i];
					failureCallback =
						typeof args[++i] === 'function'
							? args[i]
							: /* istanbul ignore next */ null;

					break;
				}
			}
		}

		return {
			modules,
			successCallback,
			failureCallback,
		};
	}

	/**
	 * Returns the registered module for the moduleName. If not found
	 * it maps the module name and return the registeredModule for the
	 * mapped name
	 * @param {string} moduleName the module name
	 * @param {Object} map the root module map
	 * @return {Object} the registed module object
	 */
	_getRegisteredModule(moduleName, map) {
		const configParser = this._getConfigParser();
		const registeredModules = configParser.getModules();

		let module = registeredModules[moduleName];

		if (!module) {
			let mappedName = configParser.mapModule(moduleName, map);
			module = registeredModules[mappedName];
		}

		return module;
	}

	/**
	 * Traverse a resolved dependencies array looking for server sent errors and
	 * return an Error if any is found.
	 * @param  {Array} dependencies the resolved dependencies
	 * @return {Error} a detailed Error or null if no errors were found
	 */
	_getResolutionError(dependencies) {
		const dependencyErrors = dependencies
			.filter(dep => dep.indexOf(':ERROR:') === 0)
			.map(dep => dep.substr(7));

		if (dependencyErrors.length > 0) {
			return new Error(
				'The following problems where detected while ' +
					'resolving modules:\n' +
					dependencyErrors.join('\n')
			);
		}

		return null;
	}

	/**
	 * Set a timeout (only if allowed by configuration) to reject a Promise if
	 * a certain set of modules has not been successfully loaded.
	 * @param {Array} modules the modules to be loaded
	 * @param {Array} mappedModules the modules after successful mapping
	 * @param {Array} dependencies the dependencies of the modules
	 * @param {function} reject the promise reject function
	 * @return {int} a timeout id or undefined if configuration disabled timeout
	 */
	_setRejectTimeout(modules, mappedModules, dependencies, reject) {
		const configParser = this._getConfigParser();
		const config = configParser.getConfig();

		let rejectTimeout;

		// Establish a load timeout and reject the Promise in case
		// of Error
		if (config.waitTimeout !== 0) {
			rejectTimeout = setTimeout(() => {
				const registeredModules = configParser.getModules();

				let error = new Error('Load timeout for modules: ' + modules);

				error.modules = modules;
				error.mappedModules = mappedModules;
				error.dependencies = dependencies;

				let filteredDeps;

				filteredDeps = dependencies.filter(
					dep =>
						typeof registeredModules[dep].implementation ===
						'undefined'
				);
				error.missingDependencies = filteredDeps;

				filteredDeps = error.missingDependencies.filter(
					dep =>
						typeof registeredModules[dep].pendingImplementation !==
						'undefined'
				);
				error.fetchedMissingDependencies = filteredDeps;

				filteredDeps = error.missingDependencies.filter(
					dep =>
						typeof registeredModules[dep].pendingImplementation ===
						'undefined'
				);
				error.unfetchedMissingDependencies = filteredDeps;

				// @deprecated: fill `dependecies` field to maintain
				// backward compatibility
				error.dependecies = error.dependencies;

				console.log('REQUIRE timeout', error);
				reject(error);
			}, config.waitTimeout || 7000);
		}

		return rejectTimeout;
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
			// Check if this is a module, which exports something
			// If so, check if the exported value is available
			let module = this._getRegisteredModule(moduleName);

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
		let missingDependencies = Object.create(null);

		for (let i = 0; i < moduleNames.length; i++) {
			const moduleName = moduleNames[i];

			let module = this._getRegisteredModule(moduleName);

			for (let j = 0; j < module.dependencies.length; j++) {
				let dependency = module.dependencies[j];

				let dependencyModule = this._getRegisteredModule(
					dependency, module.map);

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

		let mappedModules = this._getConfigParser().mapModule(requiredModules);

		let modules = this._getConfigParser().getModules();

		for (let i = 0; i < mappedModules.length; i++) {
			let requiredModule = modules[mappedModules[i]];

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

		for (let i = 0; i < moduleNames.length; i++) {
			let moduleName = moduleNames[i];

			let registeredModule = this._getRegisteredModule(moduleName);

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

			// Leave exports implementation to be {} by default
			let moduleImpl = {exports: {}};

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
					let dependencyModule = this._getRegisteredModule(
						dependency, module.map);

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
		let pathResolver = this._getPathResolver();

		return (moduleName, ...rest) => {
			if (rest.length > 0) {
				return this.require(moduleName, ...rest);
			} else {
				let resolvedPath = pathResolver.resolvePath(
					module.name, moduleName);

				let dependencyModule = this._getRegisteredModule(
					resolvedPath, module.map);

				if (
					!dependencyModule ||
					!('implementation' in dependencyModule)
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
			let mappedName = this._getConfigParser().mapModule(moduleName);
			modulePromise = this._modulesMap[mappedName];
		}

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
				let defineModules = () => {
					let definedModules = [];

					for (let i = 0; i < moduleNames.length; i++) {
						const moduleName = moduleNames[i];
						let module = this._getRegisteredModule(moduleName);
						definedModules.push(module);
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
