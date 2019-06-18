/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from './config';
import DependencyResolver from './dependency-resolver';
import ScriptLoader from './script-loader';
import URLBuilder from './url-builder';
import packageJson from '../../package.json';

/* eslint-disable no-console */

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
		this._config = new Config(config || window.__CONFIG__);

		this._dependencyResolver = new DependencyResolver(this._config);
		this._urlBuilder = new URLBuilder(this._config);
		this._scriptLoader = new ScriptLoader(
			document || window.document,
			this._config
		);

		this._requireCallId = 0;
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

		let module = config.getModule(name);

		if (module && module.defined) {
			if (config.showWarnings) {
				console.warn(
					`Liferay AMD Loader: Module '${name}' is being ` +
						'redefined; only the first definition will be used'
				);
			}

			return;
		}

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

		// Do the things
		module = config.getModule(name);

		if (!module) {
			throw new Error(
				`Trying to define a module that was not registered: ${name}\n` +
					'This usually means that someone is calling define() ' +
					'for a module that has not been previously required.'
			);
		}

		if (module.defined) {
			throw new Error(
				`Trying to define a module more than once: ${name}\n` +
					'This usually means that someone is calling define() ' +
					'more than once for the same module, which can lead to ' +
					'unexpected results.'
			);
		}

		if (config.explainResolutions) {
			console.log('Liferay AMD Loader:', 'Defining', module.name);
		}

		module.factory = factory;
		module.dependencies = dependencies;

		module.define.resolve(args);
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
		const requireCallId = this._requireCallId++;

		let moduleNames;
		let success;
		let failure;

		// Account for call polymorphism
		if (args.length == 1) {
			moduleNames = args[0];
			success = undefined;
			failure = undefined;
		} else if (args.length == 2) {
			const lastArg = args[args.length - 1];

			if (typeof lastArg === 'function') {
				moduleNames = args[0];
				success = lastArg;
				failure = undefined;
			} else if (lastArg == null) {
				moduleNames = args[0];
				success = undefined;
				failure = undefined;
			} else {
				moduleNames = args;
				success = undefined;
				failure = undefined;
			}
		} else {
			const lastArg = args[args.length - 1];
			let successGiven = false;

			if (typeof lastArg === 'function' || lastArg == null) {
				successGiven = true;
			}

			if (!successGiven) {
				moduleNames = args;
				success = undefined;
				failure = undefined;
			} else {
				const penultimateArg = args[args.length - 2];
				let failureGiven = false;

				if (
					typeof penultimateArg === 'function' ||
					penultimateArg == null
				) {
					failureGiven = true;
				}

				if (!failureGiven) {
					moduleNames = args.slice(0, args.length - 1);
					success = lastArg;
					failure = undefined;
				} else {
					moduleNames = args.slice(0, args.length - 2);
					success = penultimateArg;
					failure = lastArg;
				}
			}
		}

		// Flatten moduleNames argument if necessary
		if (typeof moduleNames === 'string') {
			moduleNames = [moduleNames];
		} else if (moduleNames.length == 1 && Array.isArray(moduleNames[0])) {
			moduleNames = [].concat(...moduleNames);
		}

		// Provide default value for success
		if (success === undefined) {
			success = () => {};
		}

		// Provide default value for failure
		if (failure === undefined) {
			const stack = new Error(
				'This is not a real error, but a fake one created to capture ' +
					"require()'s caller stack trace"
			);

			failure = error => {
				if (!config.explainResolutions) {
					return;
				}

				console.log('---------------------------------------');
				console.log('Liferay AMD Loader: Unhandled require failure:');
				console.log(
					'\nNOTE: You are seeing this message because you have\n' +
						'invoked require() without a failure handler. It\n' +
						'does not necessarily mean that the Loader is\n' +
						'broken and may be caused by errors in your code or\n' +
						'third party modules.\n\n' +
						'If you want to avoid it make sure to provide a\n' +
						'failure handler when calling require().\n\n'
				);
				console.log('A detailed report of what happened follows:');
				console.log('  · Require call id:', requireCallId);
				console.log('  · Required modules:', moduleNames);
				console.log('  · Error cause:', error);
				if (error.missingModules) {
					console.log('  · Missing modules:', error.missingModules);
				}
				console.log("  · Caller's stack trace:", stack);
				console.log('---------------------------------------');
			};
		}

		// Intercept handlers to explain resolutions
		success = this._interceptHandler(success, 'success', requireCallId);
		failure = this._interceptHandler(failure, 'failure', requireCallId);

		// Global closure variables
		let resolvedModuleNames;
		let unregisteredModuleNames;
		let rejectTimeout;
		let timeoutRejected = false;

		// Do the things (note that each then() block contains a synchronous
		// block of code, that means that between then() blocks may be
		// interrupted by any parallel call)
		this._dependencyResolver
			.resolve(moduleNames)
			.then(resolution => {
				// Show extra information when explainResolutions is active
				this._explainResolution(requireCallId, moduleNames, resolution);

				// Fail if resolution errors present
				this._throwOnResolutionErrors(resolution);

				// Merge global maps from resolution into config
				config.addMappings(resolution.configMap);

				// Merge global paths from resolution into config
				config.addPaths(resolution.pathMap);

				// Store resolved module names
				resolvedModuleNames = resolution.resolvedModules;

				// Grab unregistered module names (some of the resolved modules
				// may have been registered by a parallel require() call, so we
				// are not responsible for loading them).
				unregisteredModuleNames = this._getUnregisteredModuleNames(
					resolvedModuleNames
				);

				// Register the modules
				unregisteredModuleNames.forEach(moduleName =>
					config.addModule(moduleName, {
						map: resolution.moduleMap[moduleName],
					})
				);

				// Prepare load timeout
				rejectTimeout = this._setRejectTimeout(
					moduleNames,
					resolution,
					(...args) => {
						timeoutRejected = true;
						failure(...args);
					}
				);

				// Load the modules we are responsible for
				if (config.explainResolutions) {
					console.log(
						'Liferay AMD Loader:',
						'Fetching',
						unregisteredModuleNames,
						'from require call',
						requireCallId
					);
				}

				return moduleLoader.loadModules(unregisteredModuleNames);
			})
			.then(() => {
				// If reject timeout was hit don't do anything else
				if (timeoutRejected) return;

				// Wait for all unregistered modules to be defined
				return this._waitForModuleDefinitions(resolvedModuleNames);
			})
			.then(() => {
				// If reject timeout was hit don't do anything else
				if (timeoutRejected) return;

				// Everything went well so we can clear the timeout
				clearTimeout(rejectTimeout);

				// Set the implementations of all needed modules. Note that we
				// set the implementation of modules not loaded by this
				// require() call but it is necessary in case the require()
				// call that loaded them aborted because of an error in the
				// implementation of some module.
				this._setModuleImplementations(
					requireCallId,
					resolvedModuleNames
				);

				// Now get all needed modules implementations
				const implementations = this._getModuleImplementations(
					moduleNames
				);

				// And invoke the sucess handler
				success(...implementations);
			})
			.catch(err => {
				// If reject timeout was hit don't do anything else
				if (timeoutRejected) return;

				if (rejectTimeout) {
					clearTimeout(rejectTimeout);
				}

				failure(err);
			});
	}

	/**
	 * Intercept a require success or failure handler to show information to
	 * explain resolutions.
	 * @param {function} handler
	 * @param {string} type
	 * @param {number} requireCallId
	 */
	_interceptHandler(handler, type, requireCallId) {
		const config = this._config;

		return (...args) => {
			if (config.explainResolutions) {
				console.log(
					'Liferay AMD Loader: Invoking',
					type,
					'handler for',
					'require call',
					requireCallId
				);
			}

			try {
				handler(...args);
			} catch (err) {
				console.error(err);
			}
		};
	}

	/**
	 * Explain resolution if flag is active
	 * @param {number} requireCallId
	 * @param {Array<string>} moduleNames
	 * @param {object} resolution
	 */
	_explainResolution(requireCallId, moduleNames, resolution) {
		const config = this._config;

		if (config.explainResolutions) {
			console.log(
				'Liferay AMD Loader:',
				'Require call',
				requireCallId,
				'resolved modules',
				moduleNames,
				'to',
				resolution
			);
		}
	}

	/**
	 * Traverse a resolved dependencies array looking for server sent errors and
	 * throw an Error if any is found.
	 * @param {object} resolution the resolution object
	 * @throws {Error} if a resolution error is found
	 */
	_throwOnResolutionErrors(resolution) {
		const resolutionErrors = resolution.resolvedModules
			.filter(dep => dep.indexOf(':ERROR:') === 0)
			.map(dep => dep.substr(7));

		if (resolutionErrors.length > 0) {
			throw Object.assign(
				new Error(
					'The following problems where detected while ' +
						'resolving modules:\n' +
						resolutionErrors.map(line => `    · ${line}`).join('\n')
				),
				{resolutionErrors}
			);
		}
	}

	/**
	 * Filters a list of modules and returns only those which are not yet
	 * registered.
	 * @param {array} moduleNames list of module names to be tested
	 * @return {array} list of modules matching the specified filter
	 */
	_getUnregisteredModuleNames(moduleNames) {
		const config = this._config;

		return moduleNames.filter(moduleName => !config.getModule(moduleName));
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
			const resolvedModuleNames = resolution.resolvedModules;

			const missingModules = resolvedModuleNames.filter(moduleName => {
				const module = config.getModule(moduleName);
				return !module || !module.implemented;
			});

			const error = Object.assign(
				new Error('Load timeout for modules: ' + modules),
				{
					modules,
					resolution,
					missingModules,
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
	 * Resolves a Promise as soon as all provided modules are implemented.
	 * @param {array} moduleNames list of module names for which to wait
	 * @return {Promise}
	 */
	_waitForModuleImplementations(moduleNames) {
		const config = this._config;

		return Promise.all(
			config.getModules(moduleNames).map(module => module.implement)
		);
	}

	/**
	 * Invokes the implementation method of modules passing the implementations
	 * of its dependencies.
	 * @throws {Error} as soon as any factory fails
	 * @param {number} requireCallId
	 * @param {array} moduleNames list of modules to invoke
	 */
	_setModuleImplementations(requireCallId, moduleNames) {
		const config = this._config;

		config.getModules(moduleNames).forEach(module => {
			// Skip already implemented modules
			if (module.implemented) {
				return;
			}

			// Fail for already rejected implementations
			if (module.implement.rejected) {
				throw module.implement.rejection;
			}

			// Show info about resolution
			if (config.explainResolutions) {
				console.log(
					'Liferay AMD Loader:',
					'Implementing',
					module.name,
					'from require call',
					requireCallId
				);
			}

			try {
				// Prepare CommonJS module implementation object
				const moduleImpl = {exports: module.implementation};

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
									`Unsatisfied dependency: ${dependency} ` +
										`found in module ${module.name}`
								);
							}

							if (
								!dependencyModule.implementation &&
								!dependencyModule.implemented
							) {
								throw new Error(
									'Module "' +
										dependencyModule.name +
										'" has not been loaded yet for context: ' +
										module.name
								);
							}

							return dependencyModule.implementation;
						}
					}
				);

				// Invoke AMD factory function
				const result = module.factory(...dependencyImplementations);

				// Resolve the implementation
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

				throw err;
			}
		});
	}

	/**
	 * Create a function implementing the local require method of the AMD
	 * specification.
	 * @param  {Object} module a module descriptor
	 * @return {function} the local require implementation for the given module
	 */
	_createLocalRequire(module) {
		const config = this._config;

		const localRequire = (moduleName, ...rest) => {
			if (rest.length > 0) {
				return this.require(moduleName, ...rest);
			} else {
				const dependencyModule = config.getDependency(
					module.name,
					moduleName
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
