'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function DependencyBuilder(configParser) {
    this._configParser = configParser;

    this._init();
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
        var key = 0,
            module,
            modules;

        modules = this._configParser.getModules();

        // Set to false all temporary markers which were set during the process of dependencies resolving
        for (key in modules) {
            if (hasOwnProperty.call(modules, key)) {
                module = modules[key];

                module.conditionalMark = false;
                module.mark = false;
                module.tmpMark = false;
            }
        }

        this._queue.length = 0;
        this._result.length = 0;
    },

    _init: function() {
        var key = 0,
            module,
            modules;

        this._conditionalModules = {};

        modules = this._configParser.getModules();

        for (key in modules) {
            if (hasOwnProperty.call(modules, key)) {
                module = modules[key];

                // Set module name, overriding what may have been passed by the developer
                // or just create it, if it does not exists (the normal case)
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
            i,
            modules;

        conditionalModules = this._conditionalModules[module.name];

        // If the current module has conditional modules as dependencies,
        // add them to the list (queue) of modules, which have to be resolved.
        if (conditionalModules && !module.conditionalMark) {
            modules = this._configParser.getModules();

            for (i = 0; i < conditionalModules.length; i++) {
                conditionalModule = modules[conditionalModules[i]];

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
            module,
            modules;

        // Process all modules in the queue.
        // Note: modules may be added to the queue during the process of evaluating.

        modules = this._configParser.getModules();

        for (i = 0; i < this._queue.length; i++) {
            module = modules[this._queue[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }
    },

    _visit: function(module) {
        var i,
            moduleDependency,
            modules;

        // We support only Directed Acyclic Graph, throw exception if there are
        // circular dependencies.
        if (module.tmpMark) {
            throw new Error('Fuck, not DAG');
        }

        // Check if this module has conditional modules and add them to the queue if so.
        this._processConditionalModules(module);

        if (!module.mark) {
            module.tmpMark = true;

            modules = this._configParser.getModules();

            for (i = 0; i < module.deps.length; i++) {
                moduleDependency = modules[module.deps[i]];

                this._visit(moduleDependency, modules);
            }

            module.mark = true;

            module.tmpMark = false;

            this._result.unshift(module.name);
        }
    },

    _queue: null,
    _result: []
};

if (typeof module === 'object' && module) {
    module.exports = DependencyBuilder;
}