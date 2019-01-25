import Config from './config';
import DependencyBuilder from './dependency-builder';
import EventEmitter from './event-emitter';
import ModuleLoader from './module-loader';
import PathResolver from './path-resolver';
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
	 * @param {object=} config Configuration options (defaults to
	 * 							window.__CONFIG__)
	 * @param {object} document DOM document object to use (defaults to
	 * 								window.document)
	 * @constructor
	 */
	constructor(config = null, document = null) {
		super();

		this._pathResolver = new PathResolver();

		this._config = new Config(config || window.__CONFIG__);

		this._dependencyBuilder = new DependencyBuilder(this._config);
		this._moduleLoader = new ModuleLoader(
			document || window.document,
			this,
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
	 * {@link Loader#event:moduleDefined} event with the registered module as
	 * param.
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

		module.defined = true;
		module.factory = factory;
		module.dependencies = dependencies.map(dependency =>
			this._pathResolver.resolvePath(name, dependency)
		);

		this.emit('moduleDefined', name);
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

		// Normalize moduleNames argument
		moduleNames = moduleNames.flat();

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
		this._dependencyBuilder
			.resolveDependencies(moduleNames)
			.then(resolution => {
				const moduleLoader = this._moduleLoader;
				const config = this._config;

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

				resolvedModuleNames.forEach(resolvedModuleName =>
					config.addModule(resolvedModuleName)
				);

				// Merge module local maps from resolution
				Object.entries(moduleMap).forEach(([name, map]) => {
					const module = config.addModule(name);

					module.map = map;
				});

				// Merge global maps from resolution
				config.addMappings(configMap);

				// Merge paths from resolution
				config.addPaths(pathMap);

				// Prepare load timeout
				const rejectTimeout = this._setRejectTimeout(
					moduleNames,
					resolution,
					failure
				);

				// Load the modules
				moduleLoader.loadModules(resolvedModuleNames).then(
					() => {
						clearTimeout(rejectTimeout);

						const modules = config.getModules(moduleNames);

						const implementations = modules.map(
							module => module.implementation
						);

						success(...implementations);
					},
					err => {
						clearTimeout(rejectTimeout);
						failure(err);
					}
				);
			}, failure);
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
	 * Retrieves module implementations to an array.
	 *
	 * @memberof! Loader#
	 * @protected
	 * @param {array} modules List of modules, which implementations
	 * 					will be added to an array.
	 * @return {array} List of modules implementations.
	 */
	_getModuleImplementations(modules) {
		const config = this._config;
		const registeredModules = config.getModules();
		const mappedModules = config.mapModules(modules);

		return mappedModules.map(mappedModule => {
			const module = registeredModules[mappedModule];

			return module ? module.implementation : undefined;
		});
	}

	/**
	 * Indicates that a module has been registered through a define() call. Note
	 * that registration does not imply implementation, i.e., the module factory
	 * function has been registered but it has not been called yet.
	 * @event Loader#moduleDefined
	 * @param {object} module the registered module
	 */

	/**
	 * Indicates that a module has been successfully implemented after a
	 * define() call.
	 * @event Loader#moduleImplemented
	 * @param {object} module the registered module
	 */

	/**
	 * Indicates that a script resource has been loaded.
	 * @event Loader#scriptLoaded
	 * @param {array} modules the modules contained in the script
	 * @param {string} url the URL of the script
	 */
}

Loader.prototype.define.amd = {};
