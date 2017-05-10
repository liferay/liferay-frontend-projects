define('module-require', ['exports', 'require', 'module1'], function(
	exports,
	require,
	module1
) {
	'use strict';
	exports.resolved = require('module1') === module1;
	exports.resolvedUrl = require.toUrl('module1');
});
