'use strict';

var Promise;

if (typeof require === 'function') {
    Promise = require('ypromise');
}
else {
    Promise = this.Promise;
}

function ScriptLoader(meta) {
    this._loadedModules = [];

    this._dependencyBuilder = new DependencyBuilder(meta);
    this._urlBuilder = new URLBuilder(meta);
}

ScriptLoader.prototype = {
    constructor: ScriptLoader,

    import: function(modules) {
        var self = this;

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

                for (i = 0; i < urls.length; i++) {
                    scriptPromises.push(this._createScriptPromise(urls[i]));
                }

                Promise.all(scriptPromises).then(function(values) {
                    self._loadedModules = self._loadedModules.concat(dependenciesFinal);

                    resolve(values);
                })
                .catch(function(err) {
                    reject();
                });
            }
            else {
                resolve();
            }
        });
    },

    _createScriptPromise: function(url) {
        return new Promise(function(resolve, reject) {
            var scriptElement;

            scriptElement = document.createElement('script');

            scriptElement.src = url;

            scriptElement.onload = resolve();

            scriptElement.onerror = function(err) {
                document.body.removeChild(scriptElement);

                reject();
            };

            document.body.appendChild(scriptElement);
        });
    }
};