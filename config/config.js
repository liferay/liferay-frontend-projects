'use strict';

var config = {
    base: 'http://localhost:8080/combo?',
    modules: {
        'aui-test': {
            condition: {
                trigger: 'aui-dialog',
                test: function() {
                    return false;
                }
            },
            deps: ['aui-base'],
            path: '/html/js/aui-test.js'
        },

        'aui-test2': {
            condition: {
                trigger: 'aui-plugin-base',
                test: function() {
                    return true;
                }
            },
            deps: ['aui-base'],
            path: '/html/js/aui-test2.js'
        },

        'aui-base': {
            deps: [],
            fullPath: '/html/js/aui-base.js'
        },

        'aui-core': {
            deps: [],
            path: '/html/js/aui-core.js'
        },

        'aui-plugin-base': {
            deps: [],
            path: '/html/js/aui-plugin-base.js'
        },

        'aui-node': {
            deps: ['aui-base', 'aui-core'],
            path: '/html/js/aui-node.js'
        },

        'aui-chema': {
            condition: {
                trigger: 'aui-nate',
                test: function() {
                    return true;
                }
            },
            deps: ['aui-autocomplete', 'aui-event', 'aui-node'],
            path: '/html/js/aui-chema.js'
        },

        'aui-dialog': {
            deps: ['aui-node', 'aui-plugin-base'],
            path: '/html/js/aui-dialog.js'
        },

        'aui-dom-node': {
            deps: ['aui-node'],
            path: '/html/js/aui-dom-node.js'
        },

        'aui-autocomplete': {
            deps: ['aui-node', 'aui-dialog'],
            path: '/html/js/aui-autocomplete.js'
        },

        'aui-event': {
            deps: ['aui-node', 'aui-plugin-base'],
            path: '/html/js/aui-event.js'
        },

        'aui-nate': {
            deps: ['aui-autocomplete', 'aui-event'],
            path: '/html/js/aui-nate.js'
        }
    }
};

module.exports = config;