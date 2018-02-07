define('three', ['exports', 'module'], function(exports, module) {
	'use strict';
	function log(text) {
		console.log(text);
	}

	module.exports = log;
});
