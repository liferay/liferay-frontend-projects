'use strict';

require('../../umd/event-emitter.js');
require('../../umd/config-parser.js');
require('../../umd/dependency-builder.js');
require('../../umd/path-resolver.js');
require('../../umd/url-builder.js');

if (typeof Promise == 'undefined') {
	global.Promise = require('bluebird').Promise;
}

var v8 = require('v8-natives');

global.printStatus = function(fn) {
	var name = fn.name;

	switch (v8.getOptimizationStatus(fn)) {
		case 1:
			console.log(fn.name, 'function is optimized');
			break;
		case 2:
			console.log(fn.name, 'function is not optimized');
			break;
		case 3:
			console.log(fn.name, 'function is always optimized');
			break;
		case 4:
			console.log(fn.name, 'function is never optimized');
			break;
		case 6:
			console.log(fn.name, 'function is maybe deoptimized');
			break;
	}
};
