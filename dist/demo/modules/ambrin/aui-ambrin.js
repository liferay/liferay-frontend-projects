define("liferay@1.0.0/ambrin/aui-ambrin", ["exports", "liferay/aui-core"], function(exports, _liferayAuiCore) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function log(text) {
        (0, _liferayAuiCore.log)("module aui-chemaps says via aui-core: " + text);
    }

    exports.log = log;
});