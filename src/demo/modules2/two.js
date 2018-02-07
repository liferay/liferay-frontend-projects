define('two', ['exports', 'module', 'three'], function(
	exports,
	module,
	_three
) {
	'use strict';
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule
			? obj
			: {
				default: obj,
			};
	}

	let _log = _interopRequireDefault(_three);
	module.exports = _log['default'];
});
