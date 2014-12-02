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

    global.LoaderUtils.ConfigParser = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

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

        _parseConfig: function (config) {
            Object.forEach(config, function (key, value) {
                if (key === 'modules') {
                    this._parseModules(value);
                } else {
                    this._config[key] = value;
                }
            }, this);
        },

        _parseModules: function (modules) {
            Object.forEach(modules, function (key, module) {
                module.name = key;

                this.addModule(module);
            }, this);
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

    return ConfigParser;
}));