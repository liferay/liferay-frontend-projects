define(
	'liferay@1.0.0/relative1',
	['exports', 'module', './relative2'],
	function(exports, module, _relative2) {
		'use strict';
		function _interopRequireDefault(obj) {
			return obj && obj.__esModule
				? obj
				: {
						default: obj,
					};
		}

		var _relative22 = _interopRequireDefault(_relative2);
		module.exports = _relative22['default'];
	}
);
