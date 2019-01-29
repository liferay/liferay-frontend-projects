import PathResolver from './path-resolver';
import URLBuilder from './url-builder';

/**
 * A class responsible for loading the script resources that contain modules
 * from the server.
 */
export default class ModuleLoader {
	/**
	 * @param {object} document DOM document object to use
	 * @param {Loader} loader
	 * @param {ConfigParser} configParser
	 */
	constructor(document, loader, configParser) {
		this._document = document;
		this._loader = loader;
		this._configParser = configParser;

		this._urlBuilder = new URLBuilder(configParser);
		this._pathResolver = new PathResolver();

		this._injectedScripts = {};
	}

	/**
	 * Loads list of modules
	 * @param {Array} moduleNames List of modules to be loaded.
	 * @return {Promise} Promise which will be resolved as soon as all modules
	 * 						have been loaded.
	 */
	loadModules(moduleNames) {
		return new Promise((resolve, reject) => {
			let pendingScriptPromises = [];

			const undefinedModuleNames = this._getUndefinedModuleNames(
				moduleNames
			);

			if (undefinedModuleNames.length > 0) {
				const modulesURLs = this._urlBuilder.build(
					undefinedModuleNames
				);

				pendingScriptPromises = modulesURLs.map(modulesURL =>
					this._loadScript(modulesURL)
				);
			}

			Promise.all(pendingScriptPromises)
				.then(() => this._waitForModuleImplementations(moduleNames))
				.then(resolve)
				.catch(reject);
		});
	}

	/**
	 * Resolves a Promise as soon as all provided modules have implementation.
	 * @param {array} moduleNames list of module names for which to wait
	 * @return {Promise}
	 */
	_waitForModuleImplementations(moduleNames) {
		const configParser = this._configParser;

		return new Promise((resolve, reject) => {
			this._waitForModuleDefinitions(moduleNames).then(() => {
				const modules = configParser.getModules(moduleNames);

				try {
					this._setModuleImplementations(modules);
				} catch (err) {
					reject(err);
				}

				resolve(modules);
			}, reject);
		});
	}

	/**
	 * Resolves a Promise as soon as all provided modules are defined.
	 * @param {array} moduleNames list of module names for which to wait
	 * @return {Promise}
	 */
	_waitForModuleDefinitions(moduleNames) {
		return Promise.all(
			moduleNames.map(moduleName =>
				this._waitForModuleDefinition(moduleName)
			)
		);
	}

	/**
	 * Resolves a Promise as soon as a module has been defined
	 * @param {Object} moduleName the name of the module for which this function
	 * 								should wait
	 * @return {Promise}
	 */
	_waitForModuleDefinition(moduleName) {
		const configParser = this._configParser;
		const module = configParser.getModule(moduleName);

		if (!module.definitionPromise) {
			this._createWaitForModuleDefinitionPromise(moduleName);
		}

		return module.definitionPromise;
	}

	/**
	 * Creates a Promise that is fullfilled when it is defined
	 * @param {string} moduleName The name of module for which the Promise
	 * 					should be created
	 */
	_createWaitForModuleDefinitionPromise(moduleName) {
		const configParser = this._configParser;
		const module = configParser.getModule(moduleName);

		if (module && module.defined) {
			module.definitionPromise = Promise.resolve();
		} else {
			module.definitionPromise = new Promise(resolve => {
				const resolvePromise = definedModuleName => {
					if (definedModuleName === moduleName) {
						this._loader.off('moduleDefined', resolvePromise);

						resolve();
					}
				};

				this._loader.on('moduleDefined', resolvePromise);
			});
		}
	}

	/**
	 * Returns an array of all missing dependencies of the passed modules.
	 * A missing dependency is a dependency, which does not have pending
	 * implementation yet.
	 * @param {array} moduleNames List of module names to be checked for missing
	 * 								dependencies.
	 * @return {Array<string>} A list with all missing dependencies.
	 */
	_getUndefinedDependencies(moduleNames) {
		const configParser = this._configParser;

		let undefinedDependencies = {};

		for (let moduleName of moduleNames) {
			const module = configParser.getModule(moduleName);

			for (let dependency of module.dependencies) {
				if (
					dependency === 'require' ||
					dependency === 'exports' ||
					dependency === 'module'
				) {
					continue;
				}

				const dependencyModule = configParser.getModule(
					dependency,
					module.map
				);

				if (!dependencyModule || !dependencyModule.defined) {
					undefinedDependencies[dependency] = 1;
				}
			}
		}

		return Object.keys(undefinedDependencies);
	}

	/**
	 * Create a function implementing the local require method of the AMD
	 * specification.
	 * @param  {Object} module a module descriptor
	 * @return {function} the local require implementation for the given module
	 */
	_createLocalRequire(module) {
		const configParser = this._configParser;
		const pathResolver = this._pathResolver;

		const localRequire = (moduleName, ...rest) => {
			if (rest.length > 0) {
				return this.require(moduleName, ...rest);
			} else {
				let resolvedPath = pathResolver.resolvePath(
					module.name,
					moduleName
				);

				let dependencyModule = configParser.getModule(
					resolvedPath,
					module.map
				);

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

		localRequire.toUrl = moduleName => {
			const moduleURLs = this._urlBuilder.build([moduleName]);

			return moduleURLs[0].url;
		};

		return localRequire;
	}

	/**
	 * Loads a script element on the page.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {object} modulesURL An Object with two properties:
	 * 					- modules: List of the modules which should be loaded
	 * 					- url: The URL from which the modules should be loaded
	 * @return {Promise} Promise which will be resolved as soon as the script is
	 * 						being loaded.
	 */
	_loadScript(modulesURL) {
		return new Promise((resolve, reject) => {
			let script = this._injectedScripts[modulesURL.url];

			if (script) {
				resolve(script);
				return;
			}

			script = this._document.createElement('script');

			this._injectedScripts[modulesURL.url] = script;

			script.src = modulesURL.url;
			script.async = false;

			// On ready state change is needed for IE < 9, not sure if that is
			// needed anymore, it depends which browsers will we support at the
			// end.
			script.onload = script.onreadystatechange = () => {
				if (
					!this.readyState ||
					this.readyState === 'complete' ||
					this.readyState === 'load'
				) {
					const configParser = this._configParser;

					const modules = configParser.getModules(modulesURL.modules);

					modules.forEach(module => (module.fetched = true));

					script.onload = script.onreadystatechange = null;

					resolve(script);

					this._loader.emit(
						'scriptLoaded',
						modulesURL.modules,
						modulesURL.url
					);
				}
			};

			// If some script fails to load, reject the main Promise
			script.onerror = () => {
				this._document.head.removeChild(script);

				reject(
					Object.assign(
						new Error(
							`Unable to load script from URL ${modulesURL.url}`
						),
						{
							url: modulesURL.url,
							modules: modulesURL.modules,
							script,
						}
					)
				);
			};

			this._document.head.appendChild(script);
		});
	}

	/**
	 * Filters a list of modules and returns only these which don't have any of
	 * the provided list of properties.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} moduleNames List of modules which which have to be
	 * 						filtered.
	 * @return {array} List of modules matching the specified filter.
	 */
	_getUndefinedModuleNames(moduleNames) {
		const configParser = this._configParser;

		let missingModuleNames = [];

		for (let moduleName of moduleNames) {
			if (['require', 'exports', 'module'].indexOf(moduleName) != -1) {
				continue;
			}

			const module = configParser.getModule(moduleName);

			if (!module || !module.defined) {
				missingModuleNames.push(moduleName);
			}
		}

		return missingModuleNames;
	}

	/**
	 * Invokes the implementation method of modules passing the implementations
	 * of its dependencies.
	 * @param {array} modules list of modules to invoke
	 */
	_setModuleImplementations(modules) {
		const configParser = this._configParser;

		let errors = {};

		for (let module of modules) {
			if (module.implemented) {
				continue;
			}

			try {
				// Prepare CommonJS module implementation object
				const moduleImpl = {exports: {}};

				// Prepare arguments for the AMD factory function
				const dependencyImplementations = module.dependencies.map(
					dependency => {
						if (dependency === 'exports') {
							return moduleImpl.exports;
						} else if (dependency === 'module') {
							return moduleImpl;
						} else if (dependency === 'require') {
							return this._createLocalRequire(module);
						} else {
							const dependencyModule = configParser.getModule(
								dependency,
								module.map
							);

							if (!dependencyModule) {
								throw new Error(
									`Unsatisfied dependency: ${dependency}`
								);
							}

							return dependencyModule.implementation;
						}
					}
				);

				// Invoke AMD factory function
				const result = module.factory(...dependencyImplementations);

				if (result !== undefined) {
					module.implementation = result;
				} else {
					module.implementation = moduleImpl.exports;
				}

				module.implemented = true;
			} catch (err) {
				errors[module.name] = err;
			}
		}

		if (Object.keys(errors).length > 0) {
			throw Object.assign(
				new Error('Factory invocation failed for some modules'),
				{
					errors,
				}
			);
		}
	}
}
