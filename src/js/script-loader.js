(function() {
    'use strict';

    var Promise = window.Promise;

    if (!Promise) {
        if (typeof require === 'function') {
            Promise = require('ypromise');
        }
    }

    function ScriptLoader(configParser) {
        ScriptLoader.superclass.constructor.apply(this, arguments);

        this._configParser = configParser;

        this._dependencyBuilder = new DependencyBuilder(configParser);
        this._urlBuilder = new URLBuilder(configParser);
    }

    extend(ScriptLoader, EventEmitter2, {
        import: function(args) {
            var self = this;

            var modules = args;

            // Modules can be passed as an array or as multiple arguments.
            // If passed as arguments, they will be converted to an Array.
            var isArgsArray = Array.isArray ? Array.isArray(args) :
                Object.prototype.toString.call(args) === '[object Array]';

            if (!isArgsArray) {
                modules = Array.prototype.slice.call(arguments, 0);
            }

            return new Promise(function(resolve, reject) {
                Promise.resolve(self._dependencyBuilder.resolveDependencies(modules))
                    .then(function(dependencies) {
                        return self._loadModules(dependencies);
                    })
                    .then(function(loadedModules) {
                        var moduleImplementations = [];

                        for (var i = 0; i < modules.length; i++) {
                            moduleImplementations.push(loadedModules[modules[i]].implementation);
                        }

                        resolve(moduleImplementations);
                    })
                    .catch(function(error) {
                        console.log(error);

                        reject(error);
                    });
                });
        },

        register: function(name, dependencies, implementation, config) {
            var self = this;

            return new Promise(function(resolve, reject) {
                // Create new module by merging the provided config with the passed name,
                // dependencies and the implementation.
                var module = config || {};

                module.name = name;
                module.dependencies = dependencies;
                module.pendingImplementation = implementation;

                var dependenciesResolved = self._checkModuleDependencies(module);

                if (dependenciesResolved) {
                    self._registerModule(module);

                    resolve(module);
                }
                else {
                    var onModuleRegister = function(registeredModule) {
                        var dependenciesResolved = self._checkModuleDependencies(module);

                        if (dependenciesResolved) {
                            self.off('moduleRegister', onModuleRegister);

                            self._registerModule(module);

                            resolve(module);
                        }
                    };

                    self.on('moduleRegister', onModuleRegister);
                }
            });
        },

        _filterMissingModules: function(modules) {
            var missingModules = [];

            var registeredModules = this._configParser.getModules();

            for (var i = 0; i < modules.length; i++) {
                if (!registeredModules[modules[i]] || !registeredModules[modules[i]].implementation) {
                    missingModules.push(modules[i]);
                }
            }

            return missingModules;
        },

        _loadModules: function(modules) {
            var self = this;

            return new Promise(function(resolve, reject) {
                var missingModules = self._filterMissingModules(modules);

                if (missingModules.length) {
                    var urls = self._urlBuilder.build(missingModules);

                    var pendingScripts = [];

                    for (var i = 0; i < urls.length; i++) {
                        pendingScripts.push(self._loadScript(urls[i]));
                    }

                    Promise.all(pendingScripts)
                        .then(function(loadedScripts) {
                            var registeredModules = self._configParser.getModules();

                            var value = {};

                            for (var i = 0; i < modules.length; i++) {
                                var module = registeredModules[modules[i]];

                                if (!module.implementation) {
                                    throw 'Failed to load module: ' + module;
                                }

                                value[module.name] = module;
                            }

                            resolve(value);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                } else {
                    resolve(modules);
                }
            });
        },

        _registerModule: function(module) {
            var dependencyImplementations = [];

            var modules = this._configParser.getModules();

            for (var i = 0; i < module.dependencies.length; i++) {
                var dependency = module.dependencies[i];

                var dependencyModule = modules[dependency];

                dependencyImplementations.push(dependencyModule.implementation);
            }

            module.implementation = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

            console.log('Register module: ' + module.name);

            this._configParser.addModule(module);

            this.emit('moduleRegister', module);
        },

        _checkModuleDependencies: function(module) {
            var modules = this._configParser.getModules();

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

        _loadScript: function(url) {
            return new Promise(function(resolve, reject) {
                var scriptElement = document.createElement('script');

                scriptElement.src = url;

                console.log(url);

                scriptElement.onload = resolve;

                // Fixme: this works only in IE9+
                scriptElement.onerror = function() {
                    document.body.removeChild(scriptElement);

                    reject();
                };

                document.body.appendChild(scriptElement);
            });
        }
    });

    function mix(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }

        return destination;
    }

    function extend(r, s, px, sx) {
        if (!s || !r) {
            throw('extend failed, verify dependencies');
        }

        var sp = s.prototype, rp = Object.create(sp);
        r.prototype = rp;

        rp.constructor = r;
        r.superclass = sp;

        // assign constructor property
        if (s != Object && sp.constructor == Object.prototype.constructor) {
            sp.constructor = s;
        }

        // add prototype overrides
        if (px) {
            mix(rp, px);
        }

        // add object overrides
        if (sx) {
            mix(r, sx);
        }

        return r;
    }

    window.assertValue = function(value1) {
        if (value1 === null || typeof value1 === undefined) {
            throw value1 + ' is not defined or null';
        }
    }

    var configParser = new ConfigParser(window.__CONFIG__);

    window.ScriptLoader = new ScriptLoader(configParser);
}());