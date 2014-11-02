'use strict';

function DependencyBuilder(config) {
    this._config = config;

    this._init();
}

DependencyBuilder.prototype = {
    constructor: DependencyBuilder,

    resolve: function(dependencies) {
        var i,
            module,
            result;

        this._result.length = 0;

        for (i = 0; i < dependencies.length; i++) {
            module = this._config.modules[dependencies[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }

        result = this._result.reverse();

        this._cleanup();

        return result;
    },

    _cleanup: function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key = 0;

        for (key in this._config.modules) {
            if (hasOwnProperty.call(this._config.modules, key)) {
                module = this._config.modules[key];

                module.mark = false;
                module.tmpMark = false;
            }
        }
    },

    _init: function() {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key = 0;

        for (key in this._config.modules) {
            if (hasOwnProperty.call(this._config.modules, key)) {
                module = this._config.modules[key];

                module.name = key;
            }
        }
    },

    _visit: function(module) {
        var i,
            moduleDependency;

        if (module.tmpMark) {
            throw new Error('Fuck, not DAG');
        }

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

    _result: []
};

module.exports = DependencyBuilder;