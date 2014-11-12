'use strict';

function URLBuilder(config) {
    this._config = config;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    build: function(dependencies) {
        var buffer,
            i,
            isDepsAray,
            module,
            moduleName;

        isDepsAray = Array.isArray ? Array.isArray(dependencies) :
            Object.prototype.toString.call(dependencies) === '[object Array]';

        if (!isDepsAray) {
            dependencies = arguments;
        }

        buffer = [];

        for (i = 0; i < dependencies.length; i++) {
            moduleName = dependencies[i];

            module = this._config.modules[moduleName];

            buffer.push(module.path || module.fullPath);
        }

        return this._config.base + buffer.join('&');
    }
};

if (typeof module === 'object' && module) {
    module.exports = URLBuilder;
}