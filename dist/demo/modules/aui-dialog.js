define("liferay@1.0.0/aui-dialog", ["exports", "liferay/aui-base", "liferay/aui-core", "liferay/aui-event"], function(exports, _liferayAuiBase, _liferayAuiCore, _liferayAuiEvent) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    "use strict";

    function log(text) {
        _liferayAuiEvent.log("module aui-dialog says via aui-event: " + text);
        _liferayAuiBase.log("in module aui-dialog logBase is available: " + text);
        _liferayAuiCore.log("in module aui-dialog logCore is available: " + text);
    }

    exports.log = log;
});