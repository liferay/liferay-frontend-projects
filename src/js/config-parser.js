'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function ConfigParser(config) {
    this._groups = {'default': {}};

    this._modules = {};
    this._conditionalModules = {};

    this._parseConfig(config);
}

ConfigParser.prototype = {
    constructor: ConfigParser,

    addGroup: function(group) {
        var groupValue = this._groups[group.name];

        if (! groupValue) {
            this._groups[group.name] = groupValue = {};
        }

        for (var key in group) {
            if (hasOwnProperty.call(group, key)) {
                if (key === 'modules') {
                    this._parseModules(group[key], group.name);
                } else {
                    groupValue[key] = group[key];
                }
            }
        }
    },

    addModule: function(module) {
        this._modules[module.name] = module;

        this._registerConditionalModule(module);
    },

    getConditionalModules: function() {
        return this._conditionalModules;
    },

    getGroups: function() {
        return this._groups;
    },

    getModules: function() {
        return this._modules;
    },

    _parseConfig: function(config) {
        for (var key in config) {
            if (hasOwnProperty.call(config, key)) {
                if (key === 'groups') {
                    this._parseGroups(config[key]);
                } else if (key === 'modules') {
                    this._parseModules(config[key]);
                } else {
                    this._groups['default'][key] = config[key];
                }
            }
        }
    },

    _parseGroups: function(groups) {
        for (var key in groups) {
            if (hasOwnProperty.call(groups, key)) {
                var group = groups[key];

                group.name = key;

                this.addGroup(group);
            }
        }
    },

    _parseModules: function(modules, groupName) {
        groupName = groupName || 'default';

        for (var key in modules) {
            if (hasOwnProperty.call(modules, key)) {
                var module = modules[key];

                module.group = module.group || groupName;
                module.name = key;

                this.addModule(module);
            }
        }
    },

    _registerConditionalModule: function(module) {
        // Create an HashMap of all modules, which have conditional modules, as an Array.
        if (module.condition) {
            var existingModules = this._conditionalModules[module.condition.trigger];

            if (!existingModules) {
                this._conditionalModules[module.condition.trigger] = existingModules = [];
            }

            existingModules.push(module.name);
        }
    }
};

if (typeof module === 'object' && module) {
    module.exports = ConfigParser;
}