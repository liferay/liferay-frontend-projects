/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import packageJson from '../../package.json';
import Config from './config';
import DependencyResolver from './dependency-resolver';
import Logger from './logger';
import ScriptLoader from './script-loader';
import URLBuilder from './url-builder';

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

		this._log = new Logger(this._config);

		this._dependencyResolver = new DependencyResolver(this._config);
		this._urlBuilder = new URLBuilder(this._config);
		this._scriptLoader = new ScriptLoader(
			document || window.document,
			this._config,
			this._log
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
			this._log.warn(
				`Module '${name}' is being redefined. Only the first`,
				'definition will be used'
			);

			return;
		}

		let dependencies = args[1];
		let factory = args[2];

		// Acccount for call polymorphism

		if (args.length === 2) {
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

		this._log.resolution('Defining', module.name);

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

		if (args.length === 1) {
			moduleNames = args[0];
			success = undefined;
			failure = undefined;
		}
		else if (args.length === 2) {
			const lastArg = args[args.length - 1];

			if (typeof lastArg === 'function') {
				moduleNames = args[0];
				success = lastArg;
				failure = undefined;
			}
			else if (lastArg === null || lastArg === undefined) {
				moduleNames = args[0];
				success = undefined;
				failure = undefined;
			}
			else {
				moduleNames = args;
				success = undefined;
				failure = undefined;
			}
		}
		else {
			const lastArg = args[args.length - 1];
			let successGiven = false;

			if (
				typeof lastArg === 'function' ||
				lastArg === null ||
				lastArg === undefined
			) {
				successGiven = true;
			}

			if (!successGiven) {
				moduleNames = args;
				success = undefined;
				failure = undefined;
			}
			else {
				const penultimateArg = args[args.length - 2];
				let failureGiven = false;

				if (
					typeof penultimateArg === 'function' ||
					penultimateArg === null ||
					penultimateArg === undefined
				) {
					failureGiven = true;
				}

				if (!failureGiven) {
					moduleNames = args.slice(0, args.length - 1);
					success = lastArg;
					failure = undefined;
				}
				else {
					moduleNames = args.slice(0, args.length - 2);
					success = penultimateArg;
					failure = lastArg;
				}
			}
		}

		// Flatten moduleNames argument if necessary

		if (typeof moduleNames === 'string') {
			moduleNames = [moduleNames];
		}
		else if (moduleNames.length === 1 && Array.isArray(moduleNames[0])) {
			moduleNames = [].concat(...moduleNames);
		}

		// Provide default value for success

		if (success === undefined) {
			success = () => {};
		}

		// Provide default value for failure

		if (failure === undefined) {
			const captureStackError = new Error('');

			failure = (error) => {
				let stack = '(n/a)';

				if (captureStackError.stack) {
					stack = captureStackError.stack
						.split('\n')
						.map((line) => `        ${line}`)
						.join('\n');

					stack = `\n${stack}`;
				}

				this._log.error(
					'\n',
					'A require() call has failed but no failure handler was',
					'provided.\n',
					'Note that even if the call stack of this error trace',
					'looks like coming from the Liferay AMD Loader, it is not',
					'an error in the Loader what has caused it, but an error',
					'caused by the require() call.\n',
					'The reason why the Loader is in the stack trace is',
					"because it is printing the error so that it doesn't get",
					'lost.\n',
					'However, we recommend providing a failure handler in all',
					'require() calls to be able to recover from errors better',
					'and to avoid the appearance of this message.\n',
					'\n',
					'Some information about the require() call follows:\n',
					'  · Require call id:',
					requireCallId,
					'\n',
					'  · Required modules:',
					moduleNames,
					'\n',
					'  · Missing modules:',
					error.missingModules ? error.missingModules : '(n/a)',
					'\n',
					'  · Stack trace of the require() call:',
					`${stack}`,
					'\n',
					error
				);
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
			.then((resolution) => {

				// Show extra information when explainResolutions is active

				this._log.resolution(
					'Require call',
					requireCallId,
					'resolved modules',
					moduleNames,
					'to',
					resolution
				);

				// In case we are calling an older server, act upon errors

				this._throwOnLegacyProtocolResolutionErrors(resolution);

				// Show server warnings/errors

				this._logServerMessages(moduleNames, resolution);

				// Fail resolution on server errors

				if (resolution.errors && resolution.errors.length > 1) {
					throw Object.assign(
						new Error(
							'The server generated some errors while ' +
								'resolving modules'
						),
						{resolutionErrors: resolution.errors}
					);
				}

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

				unregisteredModuleNames.forEach((moduleName) => {
					const moduleProperties = {
						map: resolution.moduleMap[moduleName],
					};

					let moduleFlags = resolution.moduleFlags
						? resolution.moduleFlags[moduleName]
						: {};

					moduleFlags = moduleFlags || {};

					if (moduleFlags.esModule) {
						moduleProperties.esModule = true;
					}

					config.addModule(moduleName, moduleProperties);
				});

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

				this._log.resolution(
					'Fetching',
					unregisteredModuleNames,
					'from require call',
					requireCallId
				);

				return moduleLoader.loadModules(unregisteredModuleNames);
			})
			.then(() => {

				// If reject timeout was hit don't do anything else

				if (timeoutRejected) {
					return;
				}

				// Wait for all unregistered modules to be defined

				return this._waitForModuleDefinitions(resolvedModuleNames);
			})
			.then(() => {

				// If reject timeout was hit don't do anything else

				if (timeoutRejected) {
					return;
				}

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
			.catch((error) => {

				// If reject timeout was hit don't do anything else

				if (timeoutRejected) {
					return;
				}

				if (rejectTimeout) {
					clearTimeout(rejectTimeout);
				}

				failure(error);
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
		return (...args) => {
			this._log.resolution(
				'Invoking',
				type,
				'handler for',
				'require call',
				requireCallId
			);

			try {
				handler(...args);
			}
			catch (error) {
				this._log.error(
					'\n',
					'A require() call',
					type,
					'handler has thrown an error.\n',
					'Note that even if the call stack of this error trace',
					'looks like coming from the Liferay AMD Loader, it is not',
					'an error in the Loader what has caused it, but an error',
					"in the handler's code.\n",
					'The reason why the Loader is in the stack trace is',
					'because it is printing the error on behalf of the handler',
					"so that it doesn't get lost.\n",
					'However, we recommend wrapping all handler code inside a',
					'try/catch to be able to recover from errors better and to',
					'avoid the appearance of this message.\n',
					'\n',
					error
				);
			}
		};
	}

	/**
	 * Filters a list of modules and returns only those which are not yet
	 * registered.
	 * @param {array} moduleNames list of module names to be tested
	 * @return {array} list of modules matching the specified filter
	 */
	_getUnregisteredModuleNames(moduleNames) {
		const config = this._config;

		return moduleNames.filter(
			(moduleName) => !config.getModule(moduleName)
		);
	}

	/**
	 * Traverse a resolved dependencies array looking for server sent errors and
	 * throw an Error if any is found.
	 * @param {array} moduleNames list of module names to be tested
	 * @param {object} resolution the resolution object
	 */
	_logServerMessages(moduleNames, resolution) {
		if (resolution.errors && resolution.errors.length > 0) {
			this._log.error(
				'Errors returned from server for require(',
				moduleNames,
				'):',
				resolution.errors
			);
		}

		if (resolution.warnings && resolution.warnings.length > 0) {
			this._log.warn(
				'Warnings returned from server for require(',
				moduleNames,
				'):',
				resolution.warnings
			);
		}
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

			const missingModules = resolvedModuleNames.filter((moduleName) => {
				const module = config.getModule(moduleName);

				return !module || !module.implemented;
			});

			const error = Object.assign(
				new Error('Load timeout for modules: ' + modules),
				{
					missingModules,
					modules,
					resolution,
				}
			);

			reject(error);
		}, config.waitTimeout);
	}

	/**
	 * Traverse a resolved dependencies array looking for server sent errors and
	 * throw an Error if any is found.
	 *
	 * @deprecated
	 * This method exists to account for old servers' responses in new loaders.
	 * Old servers used to send resolution errors in the `resolvedModules` field
	 * marking them with the ':ERROR:' prefix (because of historical reasons).
	 *
	 * @param {object} resolution the resolution object
	 * @throws {Error} if a resolution error is found
	 */
	_throwOnLegacyProtocolResolutionErrors(resolution) {
		const resolutionErrors = resolution.resolvedModules
			.filter((dep) => dep.indexOf(':ERROR:') === 0)
			.map((dep) => dep.substr(7));

		if (resolutionErrors.length > 0) {
			throw Object.assign(
				new Error(
					'The following problems where detected while ' +
						'resolving modules:\n' +
						resolutionErrors
							.map((line) => `    · ${line}`)
							.join('\n')
				),
				{resolutionErrors}
			);
		}
	}

	/**
	 * Resolves a Promise as soon as all provided modules are defined.
	 * @param {array} moduleNames list of module names for which to wait
	 * @return {Promise}
	 */
	_waitForModuleDefinitions(moduleNames) {
		const config = this._config;

		return Promise.all(
			config.getModules(moduleNames).map((module) => module.define)
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
			config.getModules(moduleNames).map((module) => module.implement)
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

		config.getModules(moduleNames).forEach((module) => {

			// Skip already implemented modules

			if (module.implemented) {
				return;
			}

			// Fail for already rejected implementations

			if (module.implement.rejected) {
				throw module.implement.rejection;
			}

			// Show info about resolution

			this._log.resolution(
				'Implementing',
				module.name,
				'from require call',
				requireCallId
			);

			try {

				// Prepare CommonJS module implementation object

				const moduleImpl = {
					get exports() {
						return module.implementation;
					},
					set exports(exports) {
						module.implementation = exports;
					},
				};

				// Prepare arguments for the AMD factory function

				const dependencyImplementations = module.dependencies.map(
					(dependency) => {
						if (dependency === 'exports') {
							return moduleImpl.exports;
						}
						else if (dependency === 'module') {
							return moduleImpl;
						}
						else if (dependency === 'require') {
							return this._createLocalRequire(module);
						}
						else {
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
				}

				module.implement.resolve(module.implementation);
			}
			catch (error) {
				if (!module.implement.fulfilled) {
					module.implement.reject(error);
				}

				throw error;
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
			}
			else {
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

		localRequire.toUrl = (moduleName) => {
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
			.map((module) => module.implementation);
	}
}

Loader.prototype.define.amd = {};
