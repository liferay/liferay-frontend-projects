'use strict';

function URLBuilder(configParser) {
    this._configParser = configParser;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    build: function(dependencies) {
        var moduleGroups = this._distributeModulesByGroups(dependencies);

        var result = this._createURL(moduleGroups);

        return result;
    },

    _createURL: function(moduleGroups) {
        var buffer = [];
        var result = [];

        var groups = this._configParser.getGroups();
        var modules = this._configParser.getModules();

        var defaultGroup = groups['default'];

        // Loop over all groups created from modules distribution.
        Object.forEach(moduleGroups, function(key, distributedModules) {
            var group = groups[key];

            var groupPath = (group.basePath || defaultGroup.basePath);

            if (groupPath.charAt(groupPath.length - 1) !== '/') {
                groupPath += '/';
            }

            // For each group, loop over its modules.
            for (var i = 0; i < distributedModules.length; i++) {
                var module = modules[distributedModules[i]];

                // If module has fullPath or group.combine is false, individual URLs have to be created.
                if (module.fullPath) {
                    result.push(module.fullPath);

                // Else if group has explicitly set boolean combine, get its value, otherwise get the inherit value
                // from the default group.
                } else if ((typeof group.combine === 'boolean' && !group.combine) || !defaultGroup.combine) {
                    result.push((group.url || defaultGroup.url) + groupPath + module.path);

                } else {
                    // If group combine is true and module does not have full path, it will be collected
                    // in a buffer to be loaded among with other modules.
                    buffer.push(module.path);
                }

                module.load = true;
            }

            // Put to result all modules, which have to be combined.
            if (buffer.length) {
                result.push((group.url || defaultGroup.url) + '?' + groupPath + buffer.join('&' + groupPath));

                buffer.length = 0;
            }
        }, this);

        return result;
    },

    _distributeModulesByGroups: function(dependencies) {
        var moduleGroups = {};

        var modules = this._configParser.getModules();

        // Loop all modules and distribute them by their groups.
        for (var i = 0; i < dependencies.length; i++) {
            var moduleName = dependencies[i];

            var module = modules[moduleName];

            // Create a new group or retrieve the array of modules for an existing one.
            var distributedModules = moduleGroups[module.group];

            if (!distributedModules) {
                moduleGroups[module.group] = distributedModules = [];
            }

            distributedModules.push(moduleName);
        }

        return moduleGroups;
    }
};