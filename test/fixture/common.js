'use strict';

require('../../dist/source/path-resolver.js');
require('../../dist/source/event-emitter.js');
require('../../dist/source/config-parser.js');
require('../../dist/source/dependency-builder.js');
require('../../dist/source/url-builder.js');

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