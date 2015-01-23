define("aui-base", ["exports"], function (exports) {
  "use strict";

  function log(text) {
    console.log("module aui-base says", text);
  }

  exports.log = log;
});