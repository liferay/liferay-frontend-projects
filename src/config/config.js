'use strict';

var config = {
    url: 'http://foo.com/combo',
    basePath: '/js',
    combine: true,
    groups: {
        'chema': {
            basePath: '/chema',
            modules: {
                'aui-chema-group-test1': {
                    path: '/html/js/aui-chema-test1.js',
                    deps: ['aui-base', 'aui-core']
                },

                'aui-chema-group-test2': {
                    path: '/html/js/aui-chema-test2.js',
                    deps: ['aui-plugin-base']
                }
            }
        },

        'ambrin': {
            basePath: '/ambrin',
            modules: {
                'aui-ambrin-group-test3': {
                    path: 'aui-ambrin-test1.js',
                    deps: ['aui-base', 'aui-core']
                },

                'aui-ambrin-group-test4': {
                    path: 'aui-ambrin-test2.js',
                    deps: ['aui-node']
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
            path: '/html/js/aui-nate.js',
            group: 'ambrin'
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
//     'http://localhost:8080/combo?/html/js/aui-nate.js&/html/js/aui-event.js',
// }

// if (combo is false) {
//     make invididual requests for each file by combining base + module path

//     'http://localhost:8080/base/html/js/aui-nate.js',
//     'http://localhost:8080/base/html/js/aui-event.js'
// }