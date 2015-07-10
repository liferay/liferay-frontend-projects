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
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

/**
 * Creates an instance of Loader class.
 *
 * @namespace Loader
 * @extends EventEmitter
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
     *         </ul>
     *     </ul>
     * @return {Object} The constructed module.
     */
    define: function(name, dependencies, implementation, config) {
        console.log('DEFINE', name, dependencies);

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

        console.log('REQUIRE CALLED');

        var failureCallback;
        var i;
        var modules;
        var successCallback;

        // Modules can be specified by as an array, or just as parameters to the function
        // We do not slice or leak arguments to not cause V8 performance penalties
        // TODO: This could be extracted as an inline function (hint)
        var isArgsArray = Array.isArray ? Array.isArray(arguments[0]) : /* istanbul ignore next */
            Object.prototype.toString.call(arguments[0]) === '[object Array]';

        if (isArgsArray) {
            modules = arguments[0];
            successCallback = typeof arguments[1] === 'function' ? arguments[1] : null;
            failureCallback = typeof arguments[2] === 'function' ? arguments[2] : null;

        } else {
            modules = [];

            for (i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] === 'string') {
                    modules[i] = arguments[i];

                /* istanbul ignore else */
                } else if (typeof arguments[i] === 'function') {
                    successCallback = arguments[i];
                    failureCallback = typeof arguments[++i] === 'function' ? arguments[i] : /* istanbul ignore next */ null;

                    break;
                }
            }
        }

        console.log('REQUIRE called with', modules);

        var configParser = self._getConfigParser();

        // Map the required modules so we start with clean idea what the hell we should load.
        var mappedModules = configParser.mapModule(modules);

        console.log('REQUIRE modules mapped to', mappedModules);

        var resolvedDependencies;

        // Set a timeout, after which an error will be passed to the client.
        // If the user set it to 0, there will be no timeout.
        var config = configParser.getConfig();
        var rejectTimeout;

        if (config.waitTimeout !== 0) {
            rejectTimeout = setTimeout(function() {
                self._raiseRequireFailure(modules, mappedModules, resolvedDependencies, failureCallback.bind(failureCallback));
            }, config.waitTimeout || 7000);
        }

        // Resolve the dependencies of the specified modules by the user
        // then load their JS scripts
        self._resolveDependencies(mappedModules).then(function(dependencies) {
            console.log('REQUIRE dependencies resolved to', dependencies);

            resolvedDependencies = dependencies;
            return self._loadModules(dependencies);
        }).then(function(loadedModules) {
            clearTimeout(rejectTimeout);

            /* istanbul ignore else */
            if (successCallback) {
                var moduleImplementations = self._getModuleImplementations(mappedModules);
                successCallback.apply(successCallback, moduleImplementations);
            }
        }, function(error) {
            clearTimeout(rejectTimeout);

            /* istanbul ignore else */
            if (failureCallback) {
                failureCallback.call(failureCallback, error);
            }
        });
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
        });
    },

    /**
     * Returns instance of {@link ConfigParser} class.
     *
     * @memberof! Loader#
     * @protected
     * @return {ConfigParser} Instance of {@link ConfigParser} class.
     */
    _getConfigParser: function() { /* istanbul ignore else */
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
            this._dependencyBuilder = new global.DependencyBuilder(this._getConfigParser());
        }

        return this._dependencyBuilder;
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
    _getMissingDepenencies: function(moduleNames) {
        var registeredModules = this._getConfigParser().getModules();

        var missingDependencies = Object.create(null);

        for (var i = 0; i < moduleNames.length; i++) {
            var module = registeredModules[moduleNames[i]];

            for (var j = 0; j < module.dependencies.length; j++) {
                var dependency = module.dependencies[j];
                var dependencyModule = registeredModules[dependency];

                if (dependency !== 'exports' && dependency !== 'module' && (!dependencyModule || !dependencyModule.pendingImplementation)) {
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

            moduleImplementations.push(requiredModule ? requiredModule.implementation : undefined);
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
    _getURLBuilder: function() { /* istanbul ignore else */
        if (!this._urlBuilder) {
            this._urlBuilder = new global.URLBuilder(this._getConfigParser());
        }

        return this._urlBuilder;
    },

    /**
     * Filters a list of modules and returns only these which have been not yet requested for delivery via network.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules not yet requested for delivery via network.
     */
    _filterNotRequestedModules: function(modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which are not yet requested from the server.
            // We exclude "exports" and "module" modules, which are part of AMD spec.
            if ((registeredModule !== 'exports' && registeredModule !== 'module') && (!registeredModule || !registeredModule.requested)) {
                missingModules.push(modules[i]);
            }
        }

        return missingModules;
    },

    /**
     * Loads list of modules.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to be loaded.
     * @return {Promise} Promise, which will be resolved as soon as all module a being loaded.
     */
    _loadModules: function(moduleNames) {
        var self = this;

        return new Promise(function(resolve, reject) {
            // First, detect any not yet requested modules
            var notRequestedModules = self._filterNotRequestedModules(moduleNames);

            if (notRequestedModules.length) {
                // If there are not yet requested modules, construct their URLs
                var urls = self._getURLBuilder().build(notRequestedModules);

                var pendingScripts = [];

                // Create promises for each of the scripts, which should be loaded
                for (var i = 0; i < urls.length; i++) {
                    pendingScripts.push(self._loadScript(urls[i]));
                }

                // Wait for resolving all script Promises
                // As soon as that happens, wait for each module to define itself

                console.log('SCRIPTS', urls);
                Promise.all(pendingScripts).then(function(loadedScripts) {
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
                self._waitForModules(moduleNames).then(function(loadedModules) {
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
     * Loads a &ltscript&gt element on the page.
     *
     * @memberof! Loader#
     * @protected
     * @param {string} url The src of the script.
     * @return {Promise} Promise which will be resolved as soon as the script is being loaded.
     */
    _loadScript: function(url) {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');

            script.src = url;

            // On ready state change is needed for IE < 9, not sure if that is needed anymore,
            // it depends which browsers will we support at the end
            script.onload = script.onreadystatechange = function() { /* istanbul ignore else */
                if (!this.readyState || /* istanbul ignore next */ this.readyState === 'complete' || /* istanbul ignore next */ this.readyState === 'load') {

                    script.onload = script.onreadystatechange = null;

                    resolve(script);
                }
            };

            // If some script fails to load, reject the main Promise
            script.onerror = function() {
                document.body.removeChild(script);

                reject(script);
            };

            document.body.appendChild(script);
        });
    },

    /**
     * Constructs an error object and calls a function passing the error object.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules The required modules.
     * @param {array} mappedModules The required modules, after the mapping process.
     * @param {array} resolvedDependencies The resolved dependencies of the passed modules.
     * @param {Function} callback The callback which should be called, passing the constructed error object.
     */
    _raiseRequireFailure: function(modules, mappedModules, resolvedDependencies, callback) {
        var registeredModules = this._getConfigParser().getModules();

        var error = {
            mappedModules: mappedModules,
            missingDependencies: resolvedDependencies.filter(function(dep) {
                return !registeredModules[dep].implementation;
            }),
            modules: modules,
            resolvedDependecies: resolvedDependencies
        };

        console.log('REQUIRE timeout', error);

        if (callback) {
            callback(error);
        }
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
                var dependencies = self._getDependencyBuilder().resolveDependencies(modules);

                resolve(dependencies);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Invokes the implementation method of list of modules passing the implementations of its dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules to which implementation should be set.
     */
    _setModuleImplementation: function(modules) {
        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var module = modules[i];

            if (module.implementation) {
                continue;
            }

            var dependencyImplementations = [];

            // Leave exports implementation undefined by default
            var exportsImpl;
            var configParser = this._getConfigParser();

            for (var j = 0; j < module.dependencies.length; j++) {
                var dependency = module.dependencies[j];

                // If the current dependency of this module is 'exports',
                // create an empty object and pass it as implementation of
                // 'exports' module
                if (dependency === 'exports') {
                    exportsImpl = {};

                    dependencyImplementations.push(exportsImpl);
                } else if (dependency === 'module') {
                    exportsImpl = {exports: {}};

                    dependencyImplementations.push(exportsImpl);
                } else {
                    // otherwise set as value the implementation of the registered module
                    var dependencyModule = registeredModules[configParser.mapModule(dependency)];

                    var impl = dependencyModule.implementation;

                    dependencyImplementations.push(impl);
                }
            }

            var result = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

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
     * @param {object} module The module for which this function should wait.
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
     * @param {array} modules List of modules for which implementations this function should wait.
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

                var defineModules = function () {
                    var definedModules = [];

                    for (var i = 0; i < moduleNames.length; i++) {
                        definedModules.push(registeredModules[moduleNames[i]]);
                    }

                    self._setModuleImplementation(definedModules);

                    resolve(definedModules);
                };

                var missingDependencies = self._getMissingDepenencies(moduleNames);

                if (missingDependencies.length) {
                    console.log('MISSING DEPENDENCIES', 'requested', moduleNames, 'missing', missingDependencies);
                    self.require(missingDependencies, defineModules, reject);
                } else {
                    defineModules();
                }
            });
        });
    }

    /**
     * Indicates that a module has been registered.
     *
     * @event Loader#moduleRegister
     * @param {object} module - The registered module.
     */
};

Object.keys(LoaderProtoMethods).forEach(function(key) {
    Loader.prototype[key] = LoaderProtoMethods[key];
});

    return Loader;
}));