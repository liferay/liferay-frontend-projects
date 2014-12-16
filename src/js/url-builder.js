'use strict';

/**
 * Creates an instance of URLBuilder class.
 *
 * @constructor
 * @param {object} - instance of {@link ConfigParser} object.
 */
function URLBuilder(configParser) {
    this._configParser = configParser;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    /**
     * Returns a list of URLs from provided list of modules.
     *
     * @param {array} modules List of modules for which URLs should be created.
     * @return {array} List of URLs.
     */
    build: function (modules) {
        var buffer = [];
        var result = [];

        var registeredModules = this._configParser.getModules();
        var config = this._configParser.getConfig();

        var basePath = config.basePath;

        /* istanbul ignore else */
        if (basePath.charAt(basePath.length - 1) !== '/') {
            basePath += '/';
        }

        for (var i = 0; i < modules.length; i++) {
            var module = registeredModules[modules[i]];

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
            result.push(config.url + basePath + buffer.join('&' + basePath));

            buffer.length = 0;
        }

        return result;
    },

    /**
     * Returns the path for a module. If module has property path, it will be returned directly. Otherwise,
     * the name of module will be used and extension .js will be added to module name if omitted.
     *
     * @protected
     * @param {object} module The module which path should be returned.
     * @return {string} Module path.
     */
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