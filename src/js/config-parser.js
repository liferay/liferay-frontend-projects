'use strict';

var hasOwnProperty = Object.prototype.hasOwnProperty;

function ConfigParser(config) {
    this._config = config;

    this._groups = {'default': {}};

    this._modules = {};

    this._init();
}

ConfigParser.prototype = {
    constructor: ConfigParser,

    _init: function() {
        this._parseConfig();
    },

    _parseConfig: function() {
        var key;

        for (key in this._config) {
            if (hasOwnProperty.call(this._config, key)) {
                if (key === 'groups') {
                    this._parseGroups(this._config[key]);
                } else if (key === 'modules') {
                    this._parseModules(this._config[key]);
                } else {
                    this._groups['default'][key] = this._config[key];
                }
            }
        }
    },

    _parseGroups: function(groups) {
        var group,
            key;

        for (key in groups) {
            if (hasOwnProperty.call(groups, key)) {
                group = groups[key];

                group.name = key;

                this.addGroup(group);
            }
        }
    },

    _parseModules: function(modules, groupName) {
        var key,
            module;

        groupName = groupName || 'default';

        for (key in modules) {
            if (hasOwnProperty.call(modules, key)) {
                module = modules[key];

                module.group = module.group || groupName;
                module.name = key;

                this.addModule(module);
            }
        }
    },

    addGroup: function(group) {
        var groupValue,
            key;

        groupValue = this._groups[group.name];

        if (! groupValue) {
            this._groups[group.name] = groupValue = {};
        }

        for (key in group) {
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
    },

    getGroups: function() {
        return this._groups;
    },

    getModules: function() {
        return this._modules;
    }
};

if (typeof module === 'object' && module) {
    module.exports = ConfigParser;
}