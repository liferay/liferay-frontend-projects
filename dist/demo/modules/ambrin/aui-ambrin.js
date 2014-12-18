define("ambrin/aui-ambrin",
  ["aui-core","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    'use strict';

    var logCore = __dependency1__.log;

    function log(text) {
    	logCore('module aui-chemaps says via aui-core', text);
    }

    __exports__.log = log;
  });