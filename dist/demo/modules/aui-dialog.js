define('aui-dialog', ['exports', 'aui-base', 'aui-core', 'aui-event'], function (exports, _auiBase, _auiCore, _auiEvent) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    'use strict';

    function log(text) {
        _auiEvent.log('module aui-dialog says via aui-event: ' + text);
        _auiBase.log('in module aui-dialog logBase is available: ' + text);
        _auiCore.log('in module aui-dialog logCore is available: ' + text);
    }

    exports.log = log;

    // (function META() {
    //     return {
    //         condition: {
    //             test: function() {
    //                 return true;
    //             },
    //             trigger: 'nate'
    //         },
    //         path: 'nate.js'
    //     };
    // });
});