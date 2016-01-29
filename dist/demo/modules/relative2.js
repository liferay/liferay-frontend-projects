define("liferay@1.0.0/relative2", ['exports', './sub-relative/sub-relative1'], function (exports, _subRelative) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _subRelative2 = _interopRequireDefault(_subRelative);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  _subRelative2.default.log('loaded subRelative');

  exports.default = _subRelative2.default;
});