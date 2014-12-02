(function (global, factory) {
    'use strict';

    var built = factory();

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
    global.define = global.Loader.register.bind(global.Loader);
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

    function Loader(config) {
        Loader.superclass.constructor.apply(this, arguments);

        this._config = config;
    }

    LoaderUtils.extend(Loader, LoaderUtils.EventEmitter, {
        import: function (args) {
            var self = this;

            var modules = args;

            // Modules can be passed as an array or as multiple arguments.
            // If passed as arguments, they will be converted to an Array.
            var isArgsArray = Array.isArray ? Array.isArray(args) : Object.prototype.toString.call(args) === '[object Array]';

            if (!isArgsArray) {
                // The code below will work too,
                // but arguments must be not leaked for V8 peformance:
                // modules = Array.prototype.slice.call(arguments, 0);
                modules = new Array(arguments.length);

                for (var i = 0; i < arguments.length; ++i) {
                    modules[i] = arguments[i];
                }
            }

            return new Promise(function (resolve, reject) {
                self._resolveDependencies(modules).then(function (dependencies) {
                    return self._loadModules(dependencies);
                }).then(function (loadedModules) {
                    var moduleImplementations = self._addModuleImplementations(modules);

                    resolve(moduleImplementations);
                }).
                catch (function (error) {
                    console.log(error);

                    reject(error);
                });
            });
        },

        register: function (name, dependencies, implementation, config) {
            var self = this;

            return new Promise(function (resolve, reject) {
                // Create new module by merging the provided config with the passed name,
                // dependencies and the implementation.
                var module = config || {};

                module.name = name;
                module.dependencies = dependencies;
                module.pendingImplementation = implementation;

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

        require: function () {
            var self = this;

            var failureCallback;
            var modules;
            var successCallback;

            var isArgsArray = Array.isArray ? Array.isArray(arguments[0]) : Object.prototype.toString.call(arguments[0]) === '[object Array]';

            if (isArgsArray) {
                modules = arguments[0];
                successCallback = typeof arguments[1] === 'function' ? arguments[1] : null;
                failureCallback = typeof arguments[2] === 'function' ? arguments[2] : null;

            } else {
                modules = [];

                for (var i = 0; i < arguments.length; ++i) {
                    if (typeof arguments[i] === 'string') {
                        modules[i] = arguments[i];

                    } else if (typeof arguments[i] === 'function') {
                        successCallback = arguments[i];
                        failureCallback = typeof arguments[++i] === 'function' ? arguments[i] : null;

                        break;
                    } else {
                        break;
                    }
                }
            }

            self._resolveDependencies(modules).then(function (dependencies) {
                return self._loadModules(dependencies);
            }).then(function (loadedModules) {
                var moduleImplementations = self._addModuleImplementations(modules);

                if (successCallback) {
                    successCallback.apply(successCallback, moduleImplementations);
                }
            }, function (error) {
                if (failureCallback) {
                    failureCallback.call(failureCallback, error);

                } else if (successCallback) {
                    var moduleImplementations = self._addModuleImplementations(modules);

                    successCallback.apply(successCallback, moduleImplementations);
                }
            });
        },

        _addModuleImplementations: function (requiredModules) {
            var moduleImplementations = [];

            var modules = this._getConfigParser().getModules();

            for (var i = 0; i < requiredModules.length; i++) {
                var requiredModule = modules[requiredModules[i]];

                moduleImplementations.push(requiredModule ? requiredModule.implementation : undefined);
            }

            return moduleImplementations;
        },

        _checkModuleDependencies: function (module) {
            var modules = this._getConfigParser().getModules();

            var found = true;

            var dependencies = module.dependencies;

            for (var i = 0; i < dependencies.length; i++) {
                var dependencyModule = modules[dependencies[i]];

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

        _getConfigParser: function () {
            /* istanbul ignore else */
            if (!this._configParser) {
                this._configParser = new LoaderUtils.ConfigParser(this._config || __CONFIG__);
            }

            return this._configParser;
        },

        _getDependencyBuilder: function () {
            if (!this._dependencyBuilder) {
                this._dependencyBuilder = new LoaderUtils.DependencyBuilder(this._getConfigParser());
            }

            return this._dependencyBuilder;
        },

        _getURLBuilder: function () {
            if (!this._urlBuilder) {
                this._urlBuilder = new LoaderUtils.URLBuilder(this._getConfigParser());
            }

            return this._urlBuilder;
        },

        _filterModulesNoImpl: function(modules) {
            var missingModules = [];

            var registeredModules = this._getConfigParser().getModules();

            for (var i = 0; i < modules.length; i++) {
                var registeredModule = registeredModules[modules[i]];

                // Get all modules which don't have implementation
                if (!registeredModule || !registeredModule.implementation) {
                    missingModules.push(modules[i]);
                }
            }

            return missingModules;
        },

        _filterNotLoadedModules: function (modules) {
            var missingModules = [];

            var registeredModules = this._getConfigParser().getModules();

            for (var i = 0; i < modules.length; i++) {
                var registeredModule = registeredModules[modules[i]];

                // Get all modules which don't have implementarion and they were not requested from the server.
                if (!registeredModule || (!registeredModule.implementation && !registeredModule.load)) {
                    missingModules.push(modules[i]);
                }
            }

            return missingModules;
        },

        _loadModules: function (modules) {
            var self = this;

            return new Promise(function (resolve, reject) {
                var missingModules = self._filterNotLoadedModules(modules);

                if (missingModules.length) {
                    var urls = self._getURLBuilder().build(missingModules);

                    var pendingScripts = [];

                    for (var i = 0; i < urls.length; i++) {
                        pendingScripts.push(self._loadScript(urls[i]));
                    }

                    Promise.all(pendingScripts).then(function (loadedScripts) {
                        return self._waitForImplementations(modules);
                    })
                    .then(function(modules) {
                        resolve(modules);
                    })
                    .catch (function (error) {
                        reject(error);
                    });
                } else {
                    self._waitForImplementations(modules)
                        .then(function(modules) {
                            resolve(modules);
                        })
                        .catch (function (error) {
                            reject(error);
                        });
                }
            });
        },

        _registerModule: function (module) {
            var dependencyImplementations = [];

            var modules = this._getConfigParser().getModules();

            for (var i = 0; i < module.dependencies.length; i++) {
                var dependency = module.dependencies[i];

                var dependencyModule = modules[dependency];

                dependencyImplementations.push(dependencyModule.implementation);
            }

            module.implementation = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

            console.log('Register module: ' + module.name);

            this._getConfigParser().addModule(module);

            this.emit('moduleRegister', module);
        },

        _resolveDependencies: function (modules) {
            var self = this;

            return new Promise(function (resolve, reject) {
                try {
                    var registeredModules = self._getConfigParser().getModules();
                    var finalModules = [];

                    // Ignore wrongly specified (misspelled) modules
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

        _loadScript: function (url) {
            return new Promise(function (resolve, reject) {
                var script = document.createElement('script');

                script.src = url;

                console.log(url);

                script.onload = script.onreadystatechange = function () {
                    if (!this.readyState || this.readyState === 'complete' || this.readyState === 'load') {

                        script.onload = script.onreadystatechange = null;

                        resolve(script);
                    }
                };

                script.onerror = function () {
                    document.body.removeChild(script);

                    reject(script);
                };

                document.body.appendChild(script);
            });
        },

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
                        modulesPromises.push(self._waitForImplementation(registeredModules[modules[i]]));
                    }

                    Promise.all(modulesPromises)
                        .then(function(modules) {
                            resolve(modules);
                        });
                }
            });
        }
    });

    return Loader;
}));