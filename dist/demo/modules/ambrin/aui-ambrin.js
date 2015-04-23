define('ambrin/aui-ambrin', ['exports', 'aui-core'], function (exports, _auiCore) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    'use strict';

    function log(text) {
        _auiCore.log('module aui-chemaps says via aui-core', text);
    }

    exports.log = log;
});