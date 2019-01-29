import Config from './config';
import DependencyResolver from './dependency-resolver';
import ScriptLoader from './script-loader';
import PathResolver from './path-resolver';
import URLBuilder from './url-builder';
import packageJson from '../../package.json';

/**
 *
 */
export default class Loader {
	/**
	 * Creates an instance of Loader class.
	 * @namespace Loader
	 * @constructor
	 * @param {object=} config Configuration options (defaults to
	 * 							window.__CONFIG__)
	 * @param {object} document DOM document object to use (defaults to
	 * 								window.document)
	 */
	constructor(config = null, document = null) {
		this._pathResolver = new PathResolver();

		this._config = new Config(config || window.__CONFIG__);

		this._dependencyResolver = new DependencyResolver(this._config);
		this._urlBuilder = new URLBuilder(this._config);
		this._scriptLoader = new ScriptLoader(
			document || window.document,
			this._config
		);
	}

	/**
	 * Get loader version
	 * @return {String} the version number as specified in package.json
	 */
	version() {
		return packageJson.version;
	}

	/**
	 * Defines a module in the system and fires
	 * @param {string} name the name of the module
	 * @param {array} dependencies list of module dependencies
	 * @param {function} factory the AMD factory function of the module
	 */
	define(...args) {
		const config = this._config;

		const name = args[0];
		let dependencies = args[1];
		let factory = args[2];

		// Acccount for call polymorphism
		if (args.length == 2) {
			factory = dependencies;
			dependencies = ['require', 'exports', 'module'];
		}

		// Normalize factory argument
		if (typeof factory !== 'function') {
			const exportedValue = factory;

			factory = () => exportedValue;
		}

		const module = config.addModule(name);

		module.define.resolve(args);
		module.factory = factory;
		module.dependencies = dependencies.map(dependency =>
			this._pathResolver.resolvePath(name, dependency)
		);
	}

	/**
	 * Requires list of modules. If a module is not yet registered, it will be
	 * ignored and its implementation in the provided success callback will be
	 * left undefined.
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
		const moduleLoader = this._scriptLoader;
		const config = this._config;

		let moduleNames;
		let success;
		let failure;

		// Account for call polymorphism
		if (typeof args[args.length - 1] === 'function') {
			if (typeof args[args.length - 2] === 'function') {
				// Both success and failure given
				moduleNames = args.slice(0, args.length - 2);
				success = args[args.length - 2];
				failure = args[args.length - 1];
			} else {
				// Only success given
				moduleNames = args.slice(0, args.length - 1);
				success = args[args.length - 1];
				failure = undefined;
			}
		} else {
			// No success or failure given
			moduleNames = args;
			success = undefined;
			failure = undefined;
		}

		// Flatten moduleNames argument
		moduleNames = [].concat(...moduleNames);

		// Provide default value for success
		if (success === undefined) {
			success = () => {};
		}

		// Provide default value for failure
		if (failure === undefined) {
			const stack = new Error('Require caller stack trace');

			failure = error => {
				console.log('---------------------------------------');
				console.log('Liferay AMD Loader: Unhandled require failure:');
				console.log('  · modules:', moduleNames);
				console.log('  · origin:', stack);
				console.log('  · error:', error);
				['missingDependencies', 'errors'].forEach(field => {
					if (error[field]) {
						console.log(`  · ${field}:`, error[field]);
					}
				});
				console.log('---------------------------------------');
			};
		}

		// Grab the modules
		this._dependencyResolver
			.resolve(moduleNames)
			.then(resolution => {
				// Show extra information when explainResolutions is active
				if (config.explainResolutions) {
					console.log(
						'Liferay AMD Loader: Resolved modules',
						moduleNames,
						'to',
						resolution
					);
				}

				// Fail if resolution errors present
				const resolutionError = this._getResolutionError(resolution);

				if (resolutionError) {
					failure(resolutionError);

					return;
				}

				// Process resolution
				const resolvedModuleNames = resolution.resolvedModules;
				const moduleMap = resolution.moduleMap;
				const configMap = resolution.configMap;
				const pathMap = resolution.pathMap;

				// Register all resolved modules
				resolvedModuleNames.forEach(resolvedModuleName =>
					config.addModule(resolvedModuleName)
				);

				// Grab undefined modules
				const undefinedModuleNames = this._getUndefinedModuleNames(
					resolvedModuleNames
				);

				// Merge module-local maps from resolution into config
				Object.entries(moduleMap).forEach(([name, map]) => {
					const module = config.addModule(name);

					module.map = map;
				});

				// Merge global maps from resolution into config
				config.addMappings(configMap);

				// Merge paths from resolution into config
				config.addPaths(pathMap);

				// Prepare load timeout
				const rejectTimeout = this._setRejectTimeout(
					moduleNames,
					resolution,
					failure
				);

				// Load the modules
				moduleLoader
					.loadModules(undefinedModuleNames)
					.then(() =>
						this._waitForModuleDefinitions(undefinedModuleNames)
					)
					.then(() => {
						clearTimeout(rejectTimeout);

						this._setModuleImplementations(undefinedModuleNames);

						success(...this._getModuleImplementations(moduleNames));
					})
					.catch(err => {
						clearTimeout(rejectTimeout);
						failure(err);
					});
			})
			.catch(failure);
	}

	/**
	 * Get the internal module objects of the loader.
	 * @param  {...string} moduleNames the list of module names to retrieve
	 * @return {Array}
	 */
	_getModules(...moduleNames) {
		return this._config.getModules(moduleNames);
	}

	/**
	 * Filters a list of modules and returns only those which are not yet
	 * defined.
	 * @param {array} moduleNames list of module names to be tested
	 * @return {array} list of modules matching the specified filter
	 */
	_getUndefinedModuleNames(moduleNames) {
		const config = this._config;

		return moduleNames.filter(moduleName => {
			const module = config.getModule(moduleName);

			return !module || !module.defined;
		});
	}

	/**
	 * Traverse a resolved dependencies array looking for server sent errors and
	 * return an Error if any is found.
	 * @param  {object} resolution the resolution object
	 * @return {Error} a detailed Error or null if no errors were found
	 */
	_getResolutionError(resolution) {
		const resolutionErrors = resolution.resolvedModules
			.filter(dep => dep.indexOf(':ERROR:') === 0)
			.map(dep => dep.substr(7));

		if (resolutionErrors.length > 0) {
			return Object.assign(
				new Error(
					'The following problems where detected while ' +
						'resolving modules:\n' +
						resolutionErrors.join('\n')
				),
				{resolutionErrors}
			);
		}

		return null;
	}

	/**
	 * Set a timeout (only if allowed by configuration) to reject a Promise if
	 * a certain set of modules has not been successfully loaded.
	 * @param {Array} modules the modules to be loaded
	 * @param {object} resolution the resolution object associated to the
	 * 								modules
	 * @param {function} reject the promise reject function
	 * @return {int} a timeout id or undefined if configuration disabled timeout
	 */
	_setRejectTimeout(modules, resolution, reject) {
		const config = this._config;

		if (config.waitTimeout === 0) {
			return undefined;
		}

		return setTimeout(() => {
			const registeredModules = config.getModules();
			const resolvedModuleNames = resolution.resolvedModules;

			const missingDependencies = resolvedModuleNames.filter(
				dep =>
					registeredModules[dep] === undefined ||
					registeredModules[dep].implementation === undefined
			);

			const fetchedMissingDependencies = missingDependencies.filter(
				dep =>
					registeredModules[dep] !== undefined &&
					registeredModules[dep].fetched
			);

			const unfetchedMissingDependencies = missingDependencies.filter(
				dep =>
					registeredModules[dep] !== undefined &&
					!registeredModules[dep].fetched
			);

			const error = Object.assign(
				new Error('Load timeout for modules: ' + modules),
				{
					modules,
					resolution,
					missingDependencies: {
						all: missingDependencies,
						fetched: fetchedMissingDependencies,
						unfetched: unfetchedMissingDependencies,
					},
				}
			);

			reject(error);
		}, config.waitTimeout);
	}

	/**
	 * Resolves a Promise as soon as all provided modules are defined.
	 * @param {array} moduleNames list of module names for which to wait
	 * @return {Promise}
	 */
	_waitForModuleDefinitions(moduleNames) {
		const config = this._config;

		return Promise.all(
			config.getModules(moduleNames).map(module => module.define)
		);
	}

	/**
	 * Invokes the implementation method of modules passing the implementations
	 * of its dependencies.
	 * @param {array} moduleNames list of modules to invoke
	 */
	_setModuleImplementations(moduleNames) {
		const config = this._config;
		const modules = config.getModules(moduleNames);

		const errors = {};

		modules.filter(module => !module.implemented).forEach(module => {
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
							const dependencyModule = config.getDependency(
								module.name,
								dependency
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

				module.implement.resolve(module.implementation);
			} catch (err) {
				if (!module.implement.fulfilled) {
					module.implement.reject(err);
				}
				errors[module.name] = err;
			}
		});

		if (Object.keys(errors).length > 0) {
			throw Object.assign(
				new Error('Factory invocation failed for some modules'),
				{
					errors,
				}
			);
		}
	}

	/**
	 * Create a function implementing the local require method of the AMD
	 * specification.
	 * @param  {Object} module a module descriptor
	 * @return {function} the local require implementation for the given module
	 */
	_createLocalRequire(module) {
		const config = this._config;
		const pathResolver = this._pathResolver;

		const localRequire = (moduleName, ...rest) => {
			if (rest.length > 0) {
				return this.require(moduleName, ...rest);
			} else {
				let resolvedPath = pathResolver.resolvePath(
					module.name,
					moduleName
				);

				let dependencyModule = config.getDependency(
					module.name,
					resolvedPath
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
	 * Retrieves module implementations to an array.
	 * @param {array} moduleNames list of modules, which implementations
	 * 					will be collected
	 * @return {array} list of modules implementations.
	 */
	_getModuleImplementations(moduleNames) {
		const config = this._config;

		return config
			.getModules(moduleNames)
			.map(module => module.implementation);
	}
}

Loader.prototype.define.amd = {};
