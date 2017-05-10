/* global global */

setTimeout(function() {
	define('delay', ['exports', 'module'], function(exports, module) {
		'use strict';
		global.delay = 1;

		function log(text) {
			console.log(text);
		}

		module.exports = log;
	});
}, 20);
