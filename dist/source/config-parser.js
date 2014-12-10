(function (global, factory) {
    'use strict';

    var built = factory(global);

    /* istanbul ignore else */
    if (typeof module === 'object' && module) {
        module.exports = built;
    }

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(factory);
    }

    global.ConfigParser = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function (global) {

    'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Creates an instance of ConfigurationParser class.
 *
 * @constructor
 * @param {object=} - The configuration object to be parsed.
 */
function ConfigParser(config) {
    this._config = {};
    this._modules = {};
    this._conditionalModules = {};

    this._parseConfig(config);
}

ConfigParser.prototype = {
    constructor: ConfigParser,

    /**
     * Adds a module to the configuration.
     *
     * @param {object} module The module which should be added to the configuration. Should have the following
     *     properties:
     *     <ul>
     *         <strong>Obligatory properties</strong>:
     *         <li>name (String) The name of the module</li>
     *         <li>dependencies (Array) The modules from which it depends</li>
     *     </ul>
     *
     *     <strong>Optional parameters:</strong>
     *     The same as those which config parameter of {@link Loader#define} method accepts.
     */
    addModule: function (module) {
        this._modules[module.name] = module;

        this.resolvePath(module);

        this._registerConditionalModule(module);
    },

    /**
     * Returns the current configuration.
     *
     * @return {object} The current configuration.
     */
    getConfig: function() {
        return this._config;
    },

    /**
     * Returns map with all currently registered conditional modules and their triggers.
     *
     * @return {object} Map with all currently registered conditional modules.
     */
    getConditionalModules: function () {
        return this._conditionalModules;
    },

    /**
     * Returns map with all currently registered modules.
     *
     * @return {object} Map with all currently registered modules.
     */
    getModules: function () {
        return this._modules;
    },

    /**
     * Resolves module path.
     *
     * @param {object} module The module, which path should be resolved.
     */
    resolvePath: function(module) {
        var dependencies = module.dependencies;

        for (var i = 0; i < dependencies.length; i++) {
            var resolvedDependency = this._getPathResolver().resolvePath(module.name, dependencies[i]);

            dependencies[i] = resolvedDependency;
        }
    },

    /**
     * Returns the currently used instance of {@link PathResolver} object.
     *
     * @protected
     * @return {PathResolver} Instance of {@link PathResolver}
     */
    _getPathResolver: function() {
        if (!this._pathResolver) {
            this._pathResolver = new global.PathResolver();
        }

        return this._pathResolver;
    },

    /**
     * Parses configuration object.
     *
     * @protected
     * @param  {object=} config Configuration object to be parsed.
     * @return {object} The created configuration
     */
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

        return this._config;
    },

    /**
     * Parses a provided modules configuration.
     *
     * @protected
     * @param  {object} modules Map of modules to be parsed.
     * @return {object} Map of parsed modules.
     */
    _parseModules: function (modules) {
        for (var key in modules) {
            /* istanbul ignore else */
            if (hasOwnProperty.call(modules, key)) {
                var module = modules[key];

                module.name = key;

                this.addModule(module);
            }
        }

        return this._modules;
    },

    /**
     * Registers conditional module to the configuration.
     *
     * @protected
     * @param  {object} module Module object
     */
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