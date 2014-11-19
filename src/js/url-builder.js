'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function URLBuilder(configParser) {
    this._configParser = configParser;
}

URLBuilder.prototype = {
    constructor: URLBuilder,

    build: function(dependencies) {
        var moduleGroups,
            result;

        moduleGroups = this._distributeModulesGroups(dependencies);

        result = this._createURL(moduleGroups);

        return result;
    },

    _createURL: function(moduleGroups) {
        var buffer,
            defaultGroup,
            distributedModules,
            group,
            groupPath,
            groups,
            i,
            key,
            module,
            modules,
            result;

        buffer = [];
        result = [];

        groups = this._configParser.getGroups();
        modules = this._configParser.getModules();

        defaultGroup = groups['default'];

        // Loop over all groups created from modules distribution.
        for (key in moduleGroups) {
            if (hasOwnProperty.call(moduleGroups, key)) {
                distributedModules = moduleGroups[key];

                group = groups[key];

                groupPath = (group.basePath || defaultGroup.basePath);

                if (groupPath.charAt(groupPath.length - 1) !== '/') {
                    groupPath += '/';
                }

                // For each group, loop over its modules.
                for (i = 0; i < distributedModules.length; i++) {
                    module = modules[distributedModules[i]];

                    // If module has fullPath or group.combine is false, individual URLs have to be created.
                    if (module.fullPath) {
                        result.push(module.fullPath);

                    } else if (!group.combine) {
                        result.push((group.url || defaultGroup.url) + '?' + groupPath + module.path);

                    } else {
                        // If group combine is true and module does not have full path, it will be collected
                        // in a buffer to be loaded among with other modules.
                        buffer.push(module.path);
                    }
                }

                // Put to result all modules, which have to be combined.
                if (buffer.length) {
                    result.push((group.url || defaultGroup.url) + '?' + groupPath + buffer.join('&' + groupPath));

                    buffer.length = 0;
                }
            }
        }

        return result;
    },

    _distributeModulesGroups: function(dependencies) {
        var distributedModules,
            i,
            module,
            moduleGroups,
            moduleName,
            modules;

        moduleGroups = {};

        modules = this._configParser.getModules();

        // Loop all modules and distribute them by their groups.
        for (i = 0; i < dependencies.length; i++) {
            moduleName = dependencies[i];

            module = modules[moduleName];

            // Create a new group or retrieve the array of modules for an existing one.
            distributedModules = moduleGroups[module.group];

            if (!distributedModules) {
                moduleGroups[module.group] = distributedModules = [];
            }

            distributedModules.push(moduleName);
        }

        return moduleGroups;
    }
};

if (typeof module === 'object' && module) {
    module.exports = URLBuilder;
}