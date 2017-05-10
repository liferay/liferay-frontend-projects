define('module-require-async', ['exports', 'require'], function(
	exports,
	require
) {
	'use strict';
	var resolved = {};

	require('module1', 'module2', function(module1, module2) {
		resolved.module1 = module1;
		resolved.module2 = module2;
	}, function(err) {
		resolved = err;
	});

	exports.resolved = function() {
		return resolved;
	};
});
