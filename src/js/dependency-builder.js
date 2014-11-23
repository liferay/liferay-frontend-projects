'use strict';

function DependencyBuilder(configParser) {
    this._configParser = configParser;

    this._result = [];
}

DependencyBuilder.prototype = {
    constructor: DependencyBuilder,

    resolveDependencies: function(modules) {
        // Copy the passed modules to a resolving modules queue.
        // Modules may be added there during the process of resolving.
        this._queue = modules.slice(0);

        this._resolveDependencies();

        // Reorder the modules list so the modules without dependencies will
        // be moved upfront
        var result = this._result.reverse().slice(0);

        this._cleanup();

        return result;
    },

    _cleanup: function() {
        var modules = this._configParser.getModules();

        // Set to false all temporary markers which were set during the process of
        // dependencies resolving.
        Object.forEach(modules, function(key, module) {
            module.conditionalMark = false;
            module.mark = false;
            module.tmpMark = false;
        }, this);

        this._queue.length = 0;
        this._result.length = 0;
    },

    _processConditionalModules: function(module) {
        var conditionalModules = this._configParser.getConditionalModules()[module.name];

        // If the current module has conditional modules as dependencies,
        // add them to the list (queue) of modules, which have to be resolved.
        if (conditionalModules && !module.conditionalMark) {
            var modules = this._configParser.getModules();

            for (var i = 0; i < conditionalModules.length; i++) {
                var conditionalModule = modules[conditionalModules[i]];

                if (this._queue.indexOf(conditionalModule.name) === -1 &&
                    this._testConditionalModule(conditionalModule.condition.test)) {

                    this._queue.push(conditionalModule.name);
                }
            }

            module.conditionalMark = true;
        }
    },

    _resolveDependencies: function() {
        // Process all modules in the queue.
        // Note: modules may be added to the queue during the process of evaluating.
        var modules = this._configParser.getModules();

        for (var i = 0; i < this._queue.length; i++) {
            var module = modules[this._queue[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }
    },

    _testConditionalModule: function(testFunction) {
        if (typeof testFunction === 'function') {
            return testFunction();
        } else {
            debugger;
            return eval('false || ' + testFunction)();
        }
    },

    _visit: function(module) {
        // We support only Directed Acyclic Graph, throw exception if there are
        // circular dependencies.
        if (module.tmpMark) {
            throw new Error('Error processing module: ' + module + '. ' +
                'The provided configuration is not Directed Acyclic Graph.');
        }

        // Check if this module has conditional modules and add them to the queue if so.
        this._processConditionalModules(module);

        if (!module.mark) {
            module.tmpMark = true;

            var modules = this._configParser.getModules();

            for (var i = 0; i < module.dependencies.length; i++) {
                var moduleDependency = modules[module.dependencies[i]];

                this._visit(moduleDependency, modules);
            }

            module.mark = true;

            module.tmpMark = false;

            this._result.unshift(module.name);
        }
    }
};