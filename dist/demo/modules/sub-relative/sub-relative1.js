define("liferay@1.0.0/sub-relative/sub-relative1", ["exports", "module", "../relative3"], function(exports, module, _relative3) {
    "use strict";

    var _interopRequire = function(obj) {
        return (obj && obj.__esModule ? obj["default"] : obj);
    };

    var _relative32 = _interopRequire(_relative3);
    _relative32.log("inside sub-relative!");
    module.exports = _relative32;
});