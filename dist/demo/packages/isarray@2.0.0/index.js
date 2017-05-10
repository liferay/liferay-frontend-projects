define('isarray@2.0.0/index', ['exports'], function(exports) {
	exports.default = function(x) {
		console.log('Calling isArray 2.0.0');
		return Array.isArray(x);
	};
});
