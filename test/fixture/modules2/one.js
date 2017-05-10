define('one', ['exports', 'module', 'two'], function(exports, module, _two) {
	'use strict';
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule
			? obj
			: {
					default: obj,
				};
	}

	var _log = _interopRequireDefault(_two);
	module.exports = _log['default'];
});
