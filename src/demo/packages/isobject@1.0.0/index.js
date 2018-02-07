define('isobject@1.0.0/index', ['exports', 'require', 'isarray'], function(
	exports,
	require
) {
	let isArray = require('isarray').default;

	exports.default = function(x) {
		console.log('Calling isObject 1.0.0');
		return x != null && typeof x === 'object' && !isArray(x);
	};
});
