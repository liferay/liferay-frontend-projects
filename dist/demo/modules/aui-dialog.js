define("aui-dialog", ["exports", "aui-base", "aui-core", "aui-event"], function (exports, _auiBase, _auiCore, _auiEvent) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    "use strict";

    var logBase = _auiBase.log;
    var logCore = _auiCore.log;
    var logEvent = _auiEvent.log;

    function log(text) {
        logEvent("module aui-dialog says via aui-event: " + text);
        logBase("in module aui-dialog logBase is available: " + text);
        logCore("in module aui-dialog logCore is available: " + text);
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