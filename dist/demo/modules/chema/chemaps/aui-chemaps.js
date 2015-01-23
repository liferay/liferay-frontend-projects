define("chema/chemaps/aui-chemaps", ["exports", "aui-base"], function (exports, _auiBase) {
  "use strict";

  var logBase = _auiBase.log;


  function log(text) {
    logBase("module aui-chemaps says via aui-base", text);
  }

  exports.log = log;
});