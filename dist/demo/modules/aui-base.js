define('aui-base', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    'use strict';

    function log(text) {
        console.log('module aui-base says', text);
    }

    exports.log = log;
});