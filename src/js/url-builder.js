'use strict';

function URLBuilder(configParser) {
    this._configParser = configParser;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    build: function (dependencies) {
        var buffer = [];
        var result = [];

        var modules = this._configParser.getModules();
        var config = this._configParser.getConfig();

        var basePath = config.basePath;

        /* istanbul ignore else */
        if (basePath.charAt(basePath.length - 1) !== '/') {
            basePath += '/';
        }

        for (var i = 0; i < dependencies.length; i++) {
            var module = modules[dependencies[i]];

            // If module has fullPath or combine is false, individual URLs have to be created.
            if (module.fullPath) {
                result.push(module.fullPath);

            // If there is no combine, we have to generate full path URL
            } else if (!config.combine) {
                result.push(config.url + basePath + this._getModulePath(module));

            } else {
                // If combine is true and module does not have full path, it will be collected
                // in a buffer to be loaded among with other modules from combo loader.
                buffer.push(this._getModulePath(module));
            }

            module.load = true;
        }

        // Add to the result all modules, which have to be combined.
        if (buffer.length) {
            result.push(config.url + '?' + basePath + buffer.join('&' + basePath));

            buffer.length = 0;
        }

        return result;
    },

    _getModulePath: function(module) {
        if (module.path) {
            return module.path;

        } else if (module.name.indexOf('.js') !== module.name.length - 3) {
            return module.name + '.js';

        } else {
            return module.name;
        }
    }
};