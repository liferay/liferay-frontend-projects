define(
	'liferay@1.0.0/relative2',
	['exports', 'module', './sub-relative/sub-relative1'],
	function(exports, module, _subRelativeSubRelative1) {
		'use strict';
		function _interopRequireDefault(obj) {
			return obj && obj.__esModule
				? obj
				: {
						default: obj,
					};
		}

		var _subRelative = _interopRequireDefault(_subRelativeSubRelative1);
		_subRelative['default'].log('loaded subRelative');
		module.exports = _subRelative['default'];
	}
);
