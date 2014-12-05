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

    global.LoaderUtils.PathResolver = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

    function PathResolver() {}

    PathResolver.prototype = {
        constructor: PathResolver,

        resolvePath: function(module, dependency) {
            if (dependency === 'exports') {
                return dependency;
            }

            // Split module directories
            var moduleParts = module.split('/');
            // Remove module name
            moduleParts.splice(-1);

            // Split dependency directories
            var dependencyParts = dependency.split('/');
            // Extract dependecy name
            var dependencyName = dependencyParts.splice(-1);

            for (var i = 0; i < dependencyParts.length; i++) {
                var dependencyPart = dependencyParts[i];

                if (dependencyPart === '.') {
                    continue;

                } else if (dependencyPart === '..') {
                    if (moduleParts.length) {
                        moduleParts.splice(-1, 1);
                    }
                    else {
                        moduleParts = moduleParts.concat(dependencyParts.slice(i));

                        break;
                    }

                } else {
                    moduleParts.push(dependencyPart);
                }
            }

            moduleParts.push(dependencyName);

            return moduleParts.join('/');
        }
    };

    return PathResolver;
}));