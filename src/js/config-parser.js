'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function ConfigParser(config) {
    this._config = {};
    this._modules = {};
    this._conditionalModules = {};

    this._parseConfig(config);
}

ConfigParser.prototype = {
    constructor: ConfigParser,

    addModule: function (module) {
        this._modules[module.name] = module;

        this.resolveDependenciesPath(module);

        this._registerConditionalModule(module);
    },

    getConfig: function() {
        return this._config;
    },

    getConditionalModules: function () {
        return this._conditionalModules;
    },

    getModules: function () {
        return this._modules;
    },

    resolveDependenciesPath: function(module) {
        var dependencies = module.dependencies;

        for (var i = 0; i < dependencies.length; i++) {
            var resolvedDependency = this._getPathResolver().resolvePath(module.name, dependencies[i]);

            dependencies[i] = resolvedDependency;
        }
    },

    _getPathResolver: function() {
        if (!this._pathResolver) {
            this._pathResolver = new global.PathResolver();
        }

        return this._pathResolver;
    },

    _parseConfig: function (config) {
        for (var key in config) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(config, key)) {
                if (key === 'modules') {
                    this._parseModules(config[key]);
                } else {
                    this._config[key] = config[key];
                }
            }
        }
    },

    _parseModules: function (modules) {
        for (var key in modules) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(modules, key)) {
                var module = modules[key];

                module.name = key;

                this.addModule(module);
            }
        }
    },

    _registerConditionalModule: function (module) {
        // Create HashMap of all modules, which have conditional modules, as an Array.
        if (module.condition) {
            var existingModules = this._conditionalModules[module.condition.trigger];

            if (!existingModules) {
                this._conditionalModules[module.condition.trigger] = existingModules = [];
            }

            existingModules.push(module.name);
        }
    }
};