define("liferay@1.0.0/sub-relative/sub-relative1", ['exports', '../relative3'], function (exports, _relative) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _relative2 = _interopRequireDefault(_relative);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  _relative2.default.log('inside sub-relative!');

  exports.default = _relative2.default;
});