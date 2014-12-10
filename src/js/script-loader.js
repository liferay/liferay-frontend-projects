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
}

extend(Loader, global.EventEmitter, {
    /**
     * Defines a module.
     *
     * @memberof! Loader#
     * @param {string} name The name of the module.
     * @param {array} dependencies List of module dependencies.
     * @param {function} implementation The implementation of the method.
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
     * @return {Promise} Promise, will be resolved as soon as module is being registered.
     */
    define: function (name, dependencies, implementation, config) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // Create new module by merging the provided config with the passed name,
            // dependencies and the implementation.
            var module = config || {};

            module.name = name;
            module.dependencies = dependencies;
            module.pendingImplementation = implementation;

            self._getConfigParser().resolvePath(module);

            var dependeciesResolved = self._checkModuleDependencies(module);

            if (dependeciesResolved) {
                self._registerModule(module);

                resolve(module);
            } else {
                self._waitForImplementation(module)
                    .then(function(module) {
                        self._registerModule(module);
                    });
            }
        });
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
    require: function () {
        var self = this;

        var failureCallback;
        var modules;
        var successCallback;

        // Modules can be specified by as an array, or just as parameters to the function
        // We do not slice or leak arguments to not cause V8 performance penalties
        // TODO: This could be improved with inline function (hint)

        var isArgsArray = Array.isArray ? Array.isArray(arguments[0]) : /* istanbul ignore next */
            Object.prototype.toString.call(arguments[0]) === '[object Array]';

        if (isArgsArray) {
            modules = arguments[0];
            successCallback = typeof arguments[1] === 'function' ? arguments[1] : null;
            failureCallback = typeof arguments[2] === 'function' ? arguments[2] : null;

        } else {
            modules = [];

            for (var i = 0; i < arguments.length; ++i) {
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

        // Resolve the dependencies of the specified modules by the user
        // then load their JS scripts
        self._resolveDependencies(modules).then(function (dependencies) {
            return self._loadModules(dependencies);
        }).then(function (loadedModules) {
            var moduleImplementations = self._addModuleImplementations(modules);

            /* istanbul ignore else */
            if (successCallback) {
                successCallback.apply(successCallback, moduleImplementations);
            }
        }, function (error) {
            /* istanbul ignore else */
            if (failureCallback) {
                failureCallback.call(failureCallback, error);

            }
        });
    },

    /**
     * Adds module implementations to an array.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} requiredModules Lit of modules, which implementations will be added to an array.
     * @return {array} List of modules implementations.
     */
    _addModuleImplementations: function (requiredModules) {
        var moduleImplementations = [];

        var modules = this._getConfigParser().getModules();

        for (var i = 0; i < requiredModules.length; i++) {
            var requiredModule = modules[requiredModules[i]];

            moduleImplementations.push(requiredModule ? requiredModule.implementation : undefined);
        }

        return moduleImplementations;
    },

    /**
     * Checks if all module dependencies have implementations (aka they were registered) as valid modules.
     *
     * @memberof! Loader#
     * @protected
     * @param  {object} module The module which dependencies should be checked.
     * @return {boolean} Returns true if all module dependencies have implementations.
     */
    _checkModuleDependencies: function (module) {
        var modules = this._getConfigParser().getModules();

        var found = true;

        var dependencies = module.dependencies;

        for (var i = 0; i < dependencies.length; i++) {
            var dependencyName = dependencies[i];

            /* istanbul ignore else */
            if (dependencyName === 'exports') {
                continue;

            }

            var dependencyModule = modules[dependencyName];

            if (!dependencyModule) {
                throw 'Dependency ' + dependencies[i] + ' not registered as module.';
            }

            var dependencyModuleImpl = dependencyModule.implementation;

            if (!dependencyModuleImpl) {
                found = false;

                break;
            }
        }

        return found;
    },

    /**
     * Returns instance of {@link ConfigParser} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {ConfigParser} Instance of {@link ConfigParser} class.
     */
    _getConfigParser: function () {
        /* istanbul ignore else */
        if (!this._configParser) {
            this._configParser = new global.ConfigParser(this._config);
        }

        return this._configParser;
    },

    /**
     * Returns instance of {@link DependencyBuilder} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {DependencyBuilder} Instance of {@link DependencyBuilder} class.
     */
    _getDependencyBuilder: function () {
        if (!this._dependencyBuilder) {
            this._dependencyBuilder = new global.DependencyBuilder(this._getConfigParser());
        }

        return this._dependencyBuilder;
    },

    /**
     * Returns instance of {@link URLBuilder} class currently used.
     *
     * @memberof! Loader#
     * @protected
     * @return {URLBuilder} Instance of {@link URLBuilder} class.
     */
    _getURLBuilder: function () {
        /* istanbul ignore else */
        if (!this._urlBuilder) {
            this._urlBuilder = new global.URLBuilder(this._getConfigParser());
        }

        return this._urlBuilder;
    },

    /**
     * Filters a list of modules and returns only these without implementation.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules without implementation.
     */
    _filterModulesNoImpl: function(modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which don't have implementation, except 'exports' module
            if (registeredModule !== 'exports' &&
                (!registeredModule || !registeredModule.implementation)) {

                missingModules.push(modules[i]);
            }
        }

        return missingModules;
    },

    /**
     * Filters a list of modules and returns only these which have been not yet requested for delivery via network.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which which will be filtered.
     * @return {array} List of modules not yet requested for delivery via network.
     */
    _filterNotLoadedModules: function (modules) {
        var missingModules = [];

        var registeredModules = this._getConfigParser().getModules();

        for (var i = 0; i < modules.length; i++) {
            var registeredModule = registeredModules[modules[i]];

            // Get all modules which don't have implementarion and they were not requested from the server.
            if (registeredModule !== 'exports' &&
                (!registeredModule || (!registeredModule.implementation && !registeredModule.load))) {

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
    _loadModules: function (modules) {
        var self = this;

        return new Promise(function (resolve, reject) {
            // First, detect any still unloaded modules
            var missingModules = self._filterNotLoadedModules(modules);

            if (missingModules.length) {
                // If there are any, construct the URLs for them
                var urls = self._getURLBuilder().build(missingModules);

                var pendingScripts = [];

                // Create promises for each of the scripts, which should be loaded
                for (var i = 0; i < urls.length; i++) {
                    pendingScripts.push(self._loadScript(urls[i]));
                }

                // Wait for resolving the all script Promises
                // As soon as that happens, wait for each module to resolve
                // its own dependencies
                Promise.all(pendingScripts).then(function (loadedScripts) {
                    return self._waitForImplementations(modules);
                })
                // As soon as all scripts were loaded and all dependencies have been resolved,
                // resolve the main Promise
                .then(function(modules) {
                    resolve(modules);
                })
                // If any script fails to load or other error happens,
                // reject the main Promise
                .catch (function (error) {
                    reject(error);
                });
            } else {
                // If there are no any mising modules, just wait for modules dependecies
                // to be resolved and then resolve the main promise
                self._waitForImplementations(modules)
                    .then(function(modules) {
                        resolve(modules);
                    })
                    // If some error happens, for example if some module implementation
                    // throws error, reject the main Promise
                    .catch (function (error) {
                        reject(error);
                    });
            }
        });
    },

    /**
     * Registers a module and fires {@link Loader#event:moduleRegister} event with the registered module as param.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} module Module which have to be registered.
     * @fires Loader#moduleRegister
     */
    _registerModule: function (module) {
        var dependencyImplementations = [];

        var configParser = this._getConfigParser();

        var modules = configParser.getModules();

        // Leave exports implementation undefined by default
        var exportsImpl;

        for (var i = 0; i < module.dependencies.length; i++) {
            var dependency = module.dependencies[i];

            var impl;

            // If the current dependency of this module is 'exports',
            // create an empty object and pass it as implementation of
            // 'exports' module
            if (dependency === 'exports') {
                exportsImpl = {};

                dependencyImplementations.push(exportsImpl);
            }
            else {
                // otherwise set as value the implementation of the
                // registered module
                var dependencyModule = modules[dependency];

                impl = dependencyModule.implementation;

                dependencyImplementations.push(impl);
            }
        }

        var result = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

        // Store as implementation either the returned value from function invocation
        // or the implementation of the 'exports' object.
        // The final implementation of this module may be undefined if there is no
        // returned value, or the object does not have 'exports' dependency
        module.implementation = result || exportsImpl;

        configParser.addModule(module);

        this.emit('moduleRegister', module);
    },

    /**
     * Resolves modules dependencies.
     *
     * @memberof! Loader#
     * @protected
     * @param {array} modules List of modules which dependencies should be resolved.
     * @return {Promise} Promise which will be resolved as soon as all dependencies are being resolved.
     */
    _resolveDependencies: function (modules) {
        var self = this;

        return new Promise(function (resolve, reject) {
            try {
                var registeredModules = self._getConfigParser().getModules();
                var finalModules = [];

                // Ignore wrongly specified byt the user (misspelled) modules
                for (var i = 0; i < modules.length; i++) {
                    if (registeredModules[modules[i]]) {
                        finalModules.push(modules[i]);
                    }
                }

                var dependencies = self._getDependencyBuilder().resolveDependencies(finalModules);

                resolve(dependencies);
            } catch (error) {
                reject(error);
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
    _loadScript: function (url) {
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');

            script.src = url;

            // On ready state change is needed for IE < 9, not sure if that is needed anymore,
            // it depends which browsers will we support at the end
            script.onload = script.onreadystatechange = function () {
                /* istanbul ignore else */
                if (!this.readyState || /* istanbul ignore next */ this.readyState === 'complete' || /* istanbul ignore next */ this.readyState === 'load') {

                    script.onload = script.onreadystatechange = null;

                    resolve(script);
                }
            };

            // If some script fails to load, reject the main Promise
            script.onerror = function () {
                document.body.removeChild(script);

                reject(script);
            };

            document.body.appendChild(script);
        });
    },

    /**
     * Resolves a Promise as soon as all module dependencies are being resolved and it has implementation.
     *
     * @memberof! Loader#
     * @protected
     * @param {object} module The module for which implementation this function should wait.
     * @return {Promise}
     */
    _waitForImplementation: function(module) {
        var self = this;

        return new Promise(function(resolve, reject) {
            if (module.implementation) {
                resolve(module);

            } else {
                var onModuleRegister = function (registeredModule) {
                    var dependenciesResolved = self._checkModuleDependencies(module);

                    if (dependenciesResolved) {
                        self.off('moduleRegister', onModuleRegister);

                        resolve(module);
                    }
                };

                self.on('moduleRegister', onModuleRegister);
            }
        });
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
    _waitForImplementations: function(modules) {
        var self = this;

        return new Promise(function(resolve, reject) {
            var missingModules = self._filterModulesNoImpl(modules);

            if (!missingModules.length) {
                resolve(modules);
            } else {
                var modulesPromises = [];

                var registeredModules = self._getConfigParser().getModules();

                for (var i = 0; i < modules.length; i++) {
                    modulesPromises.push(self._waitForImplementation(registeredModules[missingModules[i]]));
                }

                Promise.all(modulesPromises)
                    .then(function(modules) {
                        resolve(modules);
                    });
            }
        });
    }

    /**
     * Indicates that a module has been registered.
     *
     * @event Loader#moduleRegister
     * @param {object} module - The registered module.
     */
});

// Utilities methods
function extend(r, s, px) {
    /* istanbul ignore if else */
    if (!s || !r) {
        throw ('extend failed, verify dependencies');
    }

    var sp = s.prototype,
        rp = Object.create(sp);
    r.prototype = rp;

    rp.constructor = r;
    r.superclass = sp;

    /* istanbul ignore if else */
    // assign constructor property
    if (s != Object && sp.constructor == Object.prototype.constructor) {
        sp.constructor = s;
    }

    /* istanbul ignore else */
    // add prototype overrides
    if (px) {
        mix(rp, px);
    }

    return r;
}

function mix(destination, source) {
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    for (var k in source) {
        /* istanbul ignore else */
        if (hasOwnProperty.call(source, k)) {
            destination[k] = source[k];
        }
    }

    return destination;
}