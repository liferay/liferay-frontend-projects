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
            var scriptElement = document.createElement('script');

            var dependencies = self._dependencyBuilder.resolve(modules);

            var dependenciesFinal = [];

            if (self._loadedModules.length) {
                for (var i = 0; i < dependencies.length; i++) {
                    if (self._loadedModules.indexOf(dependencies[i]) === -1) {
                        dependenciesFinal.push(dependencies[i]);
                    }
                }
            }
            else {
                dependenciesFinal = dependencies;
            }

            if (dependenciesFinal.length) {
                var url = self._urlBuilder.build(dependenciesFinal);

                scriptElement.src = url;

                scriptElement.onload = function() {
                    self._loadedModules = self._loadedModules.concat(dependenciesFinal);

                    resolve();
                };

                scriptElement.onerror = reject;

                document.body.appendChild(scriptElement);
            }
        });
    }
};