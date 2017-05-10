define(
	'liferay@1.0.0/sub-relative/sub-relative1',
	['exports', 'module', '../relative3'],
	function(exports, module, _relative3) {
		'use strict';
		function _interopRequireDefault(obj) {
			return obj && obj.__esModule
				? obj
				: {
						default: obj,
					};
		}

		var _relative32 = _interopRequireDefault(_relative3);
		_relative32['default'].log('inside sub-relative!');
		module.exports = _relative32['default'];
	}
);
