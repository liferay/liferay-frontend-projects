define("aui-core", ["exports"], function (exports) {
  "use strict";

  function log(text) {
    console.log("module aui-core says", text);
  }

  exports.log = log;
});