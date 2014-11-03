'use strict';

function DependencyBuilder(config) {
    this._config = config;

    this._init();
}

DependencyBuilder.prototype = {
    constructor: DependencyBuilder,

    resolve: function(dependencies) {
        var i,
            isDepsAray,
            module,
            result;

        isDepsAray = Array.isArray ? Array.isArray(dependencies) :
            Object.prototype.toString.call(dependencies) === '[object Array]';

        if (!isDepsAray) {
            dependencies = arguments;
        }

        for (i = 0; i < dependencies.length; i++) {
            module = this._config.modules[dependencies[i]];

            if (!module.mark) {
                this._visit(module);
            }
        }

        result = this._result.reverse().slice(0);

        this._cleanup();

        return result;
    },

    _cleanup: function() {
        var hasOwnProperty,
            key = 0,
            module;

        hasOwnProperty = Object.prototype.hasOwnProperty;

        for (key in this._config.modules) {
            if (hasOwnProperty.call(this._config.modules, key)) {
                module = this._config.modules[key];

                module.mark = false;
                module.tmpMark = false;
            }
        }

        this._result.length = 0;
    },

    _init: function() {
        var hasOwnProperty,
            key = 0,
            module;

        hasOwnProperty = Object.prototype.hasOwnProperty;

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