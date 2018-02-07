define('module-require-fail', ['exports', 'require'], function(
	exports,
	require
) {
	('use strict');
	try {
		require('non-existent-module');
	} catch (error) {
		exports.error = error;
	}
});
