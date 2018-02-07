define('module-require-path', ['exports', 'require', 'liferay'], function(
	exports,
	require,
	liferay
) {
	'use strict';
	exports.resolved = require('liferay') === liferay;
});
