'use strict';

require('../../src/js/utils.js');
require('../../src/js/path-resolver.js');
require('../../src/js/event-emitter.js');
require('../../src/js/config-parser.js');
require('../../src/js/dependency-builder.js');
require('../../src/js/url-builder.js');
require('../../src/js/script-loader.js');
var v8 = require('v8-natives');

global.printStatus = function(fn) {
    var name = fn.name;

    switch (v8.getOptimizationStatus(fn)) {
        case 1: console.log(fn.name, "function is optimized"); break;
        case 2: console.log(fn.name, "function is not optimized"); break;
        case 3: console.log(fn.name, "function is always optimized"); break;
        case 4: console.log(fn.name, "function is never optimized"); break;
        case 6: console.log(fn.name, "function is maybe deoptimized"); break;
    }
};