'use strict';

function DependencyBuilder(config) {
    this._config = config;

    this._init(config);
}

DependencyBuilder.prototype = {
    constructor: DependencyBuilder,

    resolve: function(modules) {
        var isDepsArray,
            result;

        // Modules can be passed as an array or as multiple arguments.
        // If passed as arguments, they will be converted to an Array.
        isDepsArray = Array.isArray ? Array.isArray(modules) :
            Object.prototype.toString.call(modules) === '[object Array]';

        if (!isDepsArray) {
            modules = Array.prototype.slice.call(arguments, 0);
        }

        // Copy the passed modules to a resolving modules queue.
        // Modules may be added there during the process of resolving.
        this._queue = modules.slice(0);

        this._resolve();

        // Order the modules list in from modules without dependencies first
        result = this._result.reverse().slice(0);

        this._cleanup();

        return result;
    },

    _cleanup: function() {
        var hasOwnProperty,
            key = 0,
            module;

        hasOwnProperty = Object.prototype.hasOwnProperty;

        // Set to false all temporary markers which were set during the process of dependencies resolving/
        for (key in this._config.modules) {
            if (hasOwnProperty.call(this._config.modules, key)) {
                module = this._config.modules[key];

                module.conditionalMark = false;
                module.mark = false;
                module.tmpMark = false;
            }
        }

        this._queue.length = 0;
        this._result.length = 0;
    },

    _init: function(config) {
        var hasOwnProperty,
            key = 0,
            module;

        this._conditionalModules = {};

        hasOwnProperty = Object.prototype.hasOwnProperty;

        for (key in this._config.modules) {
            if (hasOwnProperty.call(this._config.modules, key)) {
                module = this._config.modules[key];

                module.name = key;

                this._initConditionalModule(module);
            }
        }
    },

    _initConditionalModule: function(module) {
        var existingModules;

        // Create an HashMap of all modules, which have conditional modules, as an Array.
        if (module.condition) {
            existingModules = this._conditionalModules[module.condition.trigger];

            if (!existingModules) {
                this._conditionalModules[module.condition.trigger] = existingModules = [];
            }

            existingModules.push(module.name);
        }
    },

    _processConditionalModules: function(module) {
        var conditionalModule,
            conditionalModules,
            i;

        conditionalModules = this._conditionalModules[module.name];

        // If the current module has conditional modules as dependencies,
        // add them to the list (queue) of modules, which have to be resolved.
        if (conditionalModules && !module.conditionalMark) {
            for (i = 0; i < conditionalModules.length; i++) {
                conditionalModule = this._config.modules[conditionalModules[i]];

                if (this._queue.indexOf(conditionalModule.name) === -1 &&
                    conditionalModule.condition.test.call(conditionalModule)) {

                    this._queue.push(conditionalModule.name);
                }
            }

            module.conditionalMark = true;
        }
    },

    _resolve: function() {
        var i,
            module;

        for (i = 0; i < this._queue.length; i++) {
            module = this._config.modules[this._queue[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }
    },

    _visit: function(module) {
        var i,
            moduleDependency;

        // We support only Directed Acyclic Graph, throw exception if there are
        // circular dependencies.
        if (module.tmpMark) {
            throw new Error('Fuck, not DAG');
        }

        this._processConditionalModules(module);

        if (!module.mark) {
            module.tmpMark = true;

            for (i = 0; i < module.deps.length; i++) {
                moduleDependency = this._config.modules[module.deps[i]];

                this._visit(moduleDependency, this._config.modules);
            }

            module.mark = true;

            module.tmpMark = false;

            this._result.unshift(module.name);
        }
    },

    _queue: null,
    _result: []
};

module.exports = DependencyBuilder;