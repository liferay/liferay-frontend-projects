'use strict';

var __CONFIG__ = {
    url: 'http://localhost:3000/combo',
    basePath: '/modules',
    combine: true,
    groups: {
        'chema': {
            combine: true,
            url: 'http://localhost:3000/combo',
            basePath: '/modules/chema',
            modules: {
                'aui-chema-group-test1': {
                    path: 'aui-chema-group-test1.js',
                    dependencies: ['aui-base', 'aui-core']
                },

                'aui-chema-group-test2': {
                    dependencies: ['aui-plugin-base'],
                    path: 'ambrinui-chema-group-test2.js'
                }
            }
        },

        'ambrin': {
            combine: true,
            url: 'http://localhost:3000/combo',
            basePath: '/modules/ambrin',
            modules: {
                'aui-ambrin-group-test3': {
                    path: 'aui-ambrin-group-test3.js',
                    dependencies: ['aui-base', 'aui-core']
                },

                'aui-ambrin-group-test4': {
                    path: 'aui-ambrin-group-test4.js',
                    dependencies: ['aui-node']
                }
            }
        }
    },
    modules: {
        'aui-test': {
            condition: {
                trigger: 'aui-dialog',
                test: function() {
                    return false;
                }
            },
            dependencies: ['aui-base'],
            path: 'aui-test.js'
        },

        'aui-test2': {
            condition: {
                trigger: 'aui-plugin-base',
                test: function() {
                    return true;
                }
            },
            dependencies: ['aui-base'],
            path: 'aui-test2.js'
        },

        'aui-base': {
            dependencies: [],
            fullPath: 'http://localhost:8081/modules/aui-base.js'
        },

        'aui-core': {
            dependencies: [],
            path: 'aui-core.js'
        },

        'aui-plugin-base': {
            dependencies: [],
            path: 'aui-plugin-base.js'
        },

        'aui-node': {
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-node.js'
        },

        'aui-chema': {
            condition: {
                trigger: 'aui-nate',
                test: function() {
                    return true;
                }
            },
            dependencies: ['aui-autocomplete', 'aui-event', 'aui-node'],
            path: 'aui-chema.js'
        },

        'aui-dialog': {
            dependencies: ['aui-node', 'aui-plugin-base'],
            path: 'aui-dialog.js'
        },

        'aui-dom-node': {
            dependencies: ['aui-node'],
            path: 'aui-dom-node.js'
        },

        'aui-autocomplete': {
            dependencies: ['aui-node', 'aui-dialog'],
            path: 'aui-autocomplete.js'
        },

        'aui-event': {
            dependencies: ['aui-node', 'aui-plugin-base'],
            path: 'aui-event.js'
        },

        'aui-nate': {
            dependencies: ['aui-autocomplete', 'aui-event'],
            path: 'aui-nate.js'
        }
    }
};