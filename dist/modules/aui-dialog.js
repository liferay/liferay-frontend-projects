define("aui-dialog",
  ["aui-base","aui-core","aui-event","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    'use strict';

    debugger;

    var logBase = __dependency1__.log;
    var logCore = __dependency2__.log;
    var logEvent = __dependency3__.log;

    function log(text) {
    	logEvent('module aui-dialog says via aui-event: ' + text);
    	logBase('in module aui-dialog logBase is available: ' + text);
    	logCore('in module aui-dialog logCore is available: ' + text);
    }

    __exports__.log = log;
  });