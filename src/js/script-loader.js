'use strict';

function Loader(config) {
    Loader.superclass.constructor.apply(this, arguments);

    var configParser = this._configParser = new ConfigParser(config || __CONFIG__);

    this._dependencyBuilder = new DependencyBuilder(configParser);
    this._urlBuilder = new URLBuilder(configParser);
}

AUI.Utils.extend(Loader, EventEmitter, {
    import: function(args) {
        var self = this;

        var modules = args;

        // Modules can be passed as an array or as multiple arguments.
        // If passed as arguments, they will be converted to an Array.
        var isArgsArray = Array.isArray ? Array.isArray(args) :
            Object.prototype.toString.call(args) === '[object Array]';

        if (!isArgsArray) {
            // The code below will work too,
            // but arguments must be not leaked for V8 peformance:
            // modules = Array.prototype.slice.call(arguments, 0);
            modules = new Array(arguments.length);

            for (var i = 0; i < arguments.length; ++i) {
                modules[i] = arguments[i];
            }
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
            var registeredModule = registeredModules[modules[i]];

            if (!registeredModule || (!registeredModule.implementation && !registeredModule.load)) {
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
                                throw 'Failed to load module: ' + module.name;
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
            var script = document.createElement('script');

            script.src = url;

            console.log(url);

            script.onload = script.onreadystatechange = function () {
                if (!this.readyState || this.readyState === 'complete' || this.readyState === 'load') {

                    script.onload = script.onreadystatechange = null;

                    resolve(script);
                }
            };

            script.onerror = function() {
                document.body.removeChild(script);

                reject(script);
            };

            document.body.appendChild(script);
        });
    }
});