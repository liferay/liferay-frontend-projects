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

    global.LoaderUtils.ConfigParser = built;
}(typeof global !== 'undefined' ? global : /* istanbul ignore next */ this, function () {
    'use strict';

    function ConfigParser(config) {
        this._groups = {
            'default': {}
        };

        this._modules = {};
        this._conditionalModules = {};

        this._parseConfig(config);
    }

    ConfigParser.prototype = {
        constructor: ConfigParser,

        addGroup: function (group) {
            var groupValue = this._groups[group.name];

            if (!groupValue) {
                this._groups[group.name] = groupValue = {};
            }

            Object.forEach(group, function (key, value) {
                if (key === 'modules') {
                    this._parseModules(value, group.name);
                } else {
                    groupValue[key] = value;
                }
            }, this);
        },

        addModule: function (module) {
            this._modules[module.name] = module;

            this._registerConditionalModule(module);
        },

        getConditionalModules: function () {
            return this._conditionalModules;
        },

        getGroups: function () {
            return this._groups;
        },

        getModules: function () {
            return this._modules;
        },

        _parseConfig: function (config) {
            Object.forEach(config, function (key, value) {
                if (key === 'groups') {
                    this._parseGroups(value);
                } else if (key === 'modules') {
                    this._parseModules(value);
                } else {
                    this._groups['default'][key] = value;
                }
            }, this);
        },

        _parseGroups: function (groups) {
            Object.forEach(groups, function (key, group) {
                group.name = key;

                this.addGroup(group);
            }, this);
        },

        _parseModules: function (modules, groupName) {
            groupName = groupName || 'default';

            Object.forEach(modules, function (key, module) {
                module.group = module.group || groupName;
                module.name = key;

                this.addModule(module);
            }, this);
        },

        _registerConditionalModule: function (module) {
            // Create HashMap of all modules, which have conditional modules, as an Array.
            if (module.condition) {
                var existingModules = this._conditionalModules[module.condition.trigger];

                if (!existingModules) {
                    this._conditionalModules[module.condition.trigger] = existingModules = [];
                }

                existingModules.push(module.name);
            }
        }
    };

    return ConfigParser;
}));