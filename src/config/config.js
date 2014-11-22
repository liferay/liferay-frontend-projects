'use strict';

var __CONFIG__ = {
    url: 'http://localhost:3000/combo',
    basePath: '/modules',
    combine: true,
    groups: {
        'chema': {
            url: 'http://localhost:8081',
            basePath: '/modules/chema',
            modules: {
                'aui-chema-group-test1': {
                    path: 'aui-chema-group-test1.js',
                    dependencies: ['aui-base', 'aui-core']
                },

                'aui-chema-group-test2': {
                    dependencies: ['aui-plugin-base'],
                    path: 'aui-chema-group-test2.js'
                }
            }
        },

        'ambrin': {
            url: 'http://localhost:8081',
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


if (typeof module === 'object' && module) {
    module.exports = config;
}



// base

// 1. path

// 2. fullPath

// if (module has full path) {
//     unconditionally create individual request for it
// }


// if (combo is true) {
//     assume base is combo url and create combo url:
//     'http://localhost:8080/combo?aui-nate.js&/html/js/aui-event.js',
// }

// if (combo is false) {
//     make invididual requests for each file by combining base + module path

//     'http://localhost:8080/base/html/js/aui-nate.js',
//     'http://localhost:8080/base/html/js/aui-event.js'
// }