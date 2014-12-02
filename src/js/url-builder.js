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

    global.LoaderUtils.URLBuilder = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
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

            // For each group, loop over its modules.
            for (var i = 0; i < dependencies.length; i++) {
                var module = modules[dependencies[i]];

                // If module has fullPath or combine is false, individual URLs have to be created.
                if (module.fullPath) {
                    result.push(module.fullPath);

                // The group does not have combine, so we have to generate full path URL
                } else if (!config.combine) {
                    result.push(config.url + basePath + module.path);

                } else {
                    // If group combine is true and module does not have full path, it will be collected
                    // in a buffer to be loaded among with other modules from combo loader.
                    buffer.push(module.path);
                }

                module.load = true;
            }

            // Put to result all modules, which have to be combined.
            if (buffer.length) {
                result.push(config.url + '?' + basePath + buffer.join('&' + basePath));

                buffer.length = 0;
            }

            return result;
        }
    };

    return URLBuilder;
}));