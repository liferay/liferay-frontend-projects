(function() {
    'use strict';

    var Promise = window.Promise;

    if (!Promise) {
        if (typeof require === 'function') {
            Promise = require('ypromise');
        }
    }

    function ScriptLoader(configParser) {
        this._loadedModules = [];

        this._configParser = configParser;

        this._dependencyBuilder = new DependencyBuilder(configParser);
        this._urlBuilder = new URLBuilder(configParser);

        this._pendingImports = [];

        this._moduleRegisterListener = this._onModuleRegister.bind(this);

        window.eventEmitter.on('moduleRegsiter', this._moduleRegisterListener);
    }

    ScriptLoader.prototype = {
        constructor: ScriptLoader,

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
                    dependenciesFinal,
                    i,
                    scriptPromises,
                    urls;

                dependencies = self._dependencyBuilder.resolve(modules);

                dependenciesFinal = [];

                // Skip already loaded modules.
                if (self._loadedModules.length) {
                    for (i = 0; i < dependencies.length; i++) {
                        if (self._loadedModules.indexOf(dependencies[i]) === -1) {
                            dependenciesFinal.push(dependencies[i]);
                        }
                    }
                }
                else {
                    dependenciesFinal = dependencies;
                }

                if (dependenciesFinal.length) {
                    urls = self._urlBuilder.build(dependenciesFinal);

                    // Store the not yet loaded modules in an array, together with the
                    // resolving promise method.
                    self._pendingImports.push({
                        deps: dependenciesFinal,
                        callback: resolve
                    });

                    scriptPromises = [];

                    // Create promises for all URLs. Note we don't resolve the main promise when
                    // URL promises are being resolved. We will only reject the main promise if
                    // any of these fails. The main promise will be resolved later, when each pending
                    // module registers.
                    for (i = 0; i < urls.length; i++) {
                        scriptPromises.push(self._createScriptPromise(urls[i]));
                    }

                    Promise.all(scriptPromises).catch(function(err) {
                        reject();
                    });
                }
                else {
                    resolve();
                }
            });
        },

        register: function(name, dependencies, implementation, config) {
            // Create new module by merging the provided config with the passed name,
            // dependencies and the implementation
            var module = config || {};

            module.name = name;
            module.deps = dependencies;
            module.implementation = implementation;

            this._configParser.addModule(module);

            window.eventEmitter.emit('moduleRegsiter', module);
        },

        _createScriptPromise: function(url) {
            return new Promise(function(resolve, reject) {
                var scriptElement;

                scriptElement = document.createElement('script');

                scriptElement.src = url;

                console.log(url)

                scriptElement.onload = function(a, b, c, d) {
                    debugger;
                    resolve();
                };

                scriptElement.onerror = function(err) {
                    document.body.removeChild(scriptElement);

                    reject();
                };

                document.body.appendChild(scriptElement);
            });
        },

        _onModuleRegister: function(event) {
            var found,
                i,
                imports,
                j,
                module;

            debugger;

            for (i = 0; i < this._pendingImports.length; i++) {
                found = true;

                imports = this._pendingImports[i];

                for(j = 0; j < imports.deps.length; j++) {
                    module = imports.deps[j];

                    if (this._configParser.getModules()[module].implementation) {
                        found = false;
                        break;
                    }
                }

                if (found) {
                    this._resolveImport(imports);
                }
            },

            _resolveImport: function(imports) {
                this._loadedModules = this._loadedModules.concat(dependenciesFinal);

                resolve(values);
            }
        }
    };

    var configParser = new ConfigParser(window.__CONFIG__);

    window.ScriptLoader = new ScriptLoader(configParser);
}());