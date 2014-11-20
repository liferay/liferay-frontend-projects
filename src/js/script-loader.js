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

        this._pendingModules = [];

        this._pendingImports = [];

        this._moduleRegisterListener = this._onModuleRegister.bind(this);

        this.on('moduleRegister', this._moduleRegisterListener);
    }

    extend(ScriptLoader, EventEmitter2, {
        import: function(args) {
            var self = this,
                isArgsArray,
                modules;

            // Modules can be passed as an array or as multiple arguments.
            // If passed as arguments, they will be converted to an Array.
            isArgsArray = Array.isArray ? Array.isArray(arguments) :
                Object.prototype.toString.call(arguments) === '[object Array]';

            if (!isArgsArray) {
                modules = Array.prototype.slice.call(arguments, 0);
            }
            else {
                modules = arguments;
            }

            return new Promise(function(resolve, reject) {
                var dependencies,
                    i,
                    missingDependencies,
                    registeredModules,
                    scriptPromises,
                    urls;

                // Resolve the dependencies of the modules which have to be imported.
                dependencies = self._dependencyBuilder.resolve(modules);

                missingDependencies = [];

                registeredModules = self._configParser.getModules();

                // Skip already loaded modules.
                for (i = 0; i < dependencies.length; i++) {
                    if (!registeredModules[dependencies[i]] || !registeredModules[dependencies[i]].implementation) {
                        missingDependencies.push(dependencies[i]);
                    }
                }

                if (missingDependencies.length) {
                    urls = self._urlBuilder.build(missingDependencies);

                    // Store the not yet loaded modules, together with the
                    // resolving promise method.
                    self._pendingImports.push({
                        modules: modules,
                        dependencies: dependencies,
                        resolve: resolve
                    });

                    scriptPromises = [];

                    // Create promises for all URLs. Note we don't resolve the main promise when
                    // URL promises are being resolved. We will only reject the main promise if
                    // any of these fails. The main promise will be resolved later, when each pending
                    // module registers.
                    for (i = 0; i < urls.length; i++) {
                        scriptPromises.push(self._createScriptPromise(urls[i]));
                    }

                    // Reject the main promise if any of the URLs fails to import
                    Promise.all(scriptPromises).catch(function(err) {
                        reject();
                    });
                } else {
                    self._resolveImports({
                        modules: modules,
                        dependencies: dependencies,
                        resolve: resolve
                    });
                }
            });
        },

        register: function(name, dependencies, implementation, config) {
            var dependenciesResolved,
                modules;

            // Create new module by merging the provided config with the passed name,
            // dependencies and the implementation.
            var module = config || {};

            module.name = name;
            module.dependencies = dependencies;
            module.pendingImplementation = implementation;

            modules = this._configParser.getModules();

            dependenciesResolved = this._checkModuleDependencies(module);

            if (dependenciesResolved) {
                this._registerModule(module);
            }
            else {
                this._pendingModules.push(module);
            }
        },

        _checkModuleDependencies: function(module) {
            var dependencies,
                dependencyModule,
                dependencyModuleImpl,
                found,
                i,
                modules;

            modules = this._configParser.getModules();

            found = true;

            dependencies = module.dependencies;

            for (i = 0; i < dependencies.length; i++) {
                dependencyModule = modules[dependencies[i]];

                if (!dependencyModule) {
                    throw 'Dependency ' + dependencies[i] + ' not registered as module.';
                }

                dependencyModuleImpl = dependencyModule.implementation;

                if (!dependencyModuleImpl) {
                    found = false;

                    break;
                }
            }

            return found;
        },

        _createScriptPromise: function(url) {
            return new Promise(function(resolve, reject) {
                var scriptElement;

                scriptElement = document.createElement('script');

                scriptElement.src = url;

                console.log(url);

                scriptElement.onload = function(a, b, c, d) {
                    resolve();
                };

                scriptElement.onerror = function(err) {
                    document.body.removeChild(scriptElement);

                    reject();
                };

                document.body.appendChild(scriptElement);
            });
        },

        _onModuleRegister: function(module) {
            var dependenciesResolved,
                dependency,
                found,
                i,
                imports,
                j,
                modules,
                pendingModule;

            modules = this._configParser.getModules();

            for (i = 0; i < this._pendingModules.length; i++) {
                pendingModule = this._pendingModules[i];

                dependenciesResolved = this._checkModuleDependencies(pendingModule);

                if (dependenciesResolved) {
                    console.log('pendingModule: ' + pendingModule.name);

                    this._pendingModules.splice(i--, 1);

                    this._registerModule(pendingModule);
                }
            }

            // For all pending imports, check if all their dependencies are resolved.
            // If so, resolve the main promise.
            for (i = 0; i < this._pendingImports.length; i++) {
                found = true;

                imports = this._pendingImports[i];

                for(j = 0; j < imports.dependencies.length; j++) {
                    dependency = imports.dependencies[j];

                    if (!modules[dependency].implementation) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    this._resolveImports(imports);

                    this._pendingImports.splice(i--, 1);
                }
            }
        },

        _registerModule: function(module) {
            var dependency,
                dependencyImplementations,
                dependencyModule,
                i,
                modules;

            modules = this._configParser.getModules();

            dependencyImplementations = [];

            for (i = 0; i < module.dependencies.length; i++) {
                dependency = module.dependencies[i];

                dependencyModule = modules[dependency];

                dependencyImplementations.push(dependencyModule.implementation);
            }

            console.log('Register module: ' + module.name);

            module.implementation = module.pendingImplementation.apply(module.pendingImplementation, dependencyImplementations);

            this._configParser.addModule(module);

            this.emit('moduleRegister', module);
        },

        _resolveImports: function(imports) {
            var i,
                implementations,
                modules;

            // Imports is an object with the following params:
            // modules - the modules, as provided from the developer
            // dependencies - all modules dependencies
            // resolve - the promise resolve function, which have to be called.

            implementations = [];

            modules = this._configParser.getModules();

            for (i = 0; i < imports.modules.length; i++) {
                implementations.push(modules[imports.modules[i]].implementation);
            }

            imports.resolve(implementations);
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