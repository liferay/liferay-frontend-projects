"use strict";

Liferay.Loader.define("test-project@1.0.0/AppComponent", ['module', 'exports', 'require', 'liferay!frontend-js-react-web$react', 'liferay!frontend-js-react-web$react-dom'], function (module, exports, require) {
  var define = undefined;
  var global = window;
  {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = AppComponent;

    var _react = _interopRequireDefault(require("liferay!frontend-js-react-web$react"));

    var _reactDom = _interopRequireDefault(require("liferay!frontend-js-react-web$react-dom"));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }

    function AppComponent(props) {
      return (/*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "tag"
        }, Liferay.Language.get('portlet-namespace'), ":"), /*#__PURE__*/_react["default"].createElement("span", {
          className: "value"
        }, props.portletNamespace)), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "tag"
        }, Liferay.Language.get('context-path'), ":"), /*#__PURE__*/_react["default"].createElement("span", {
          className: "value"
        }, props.contextPath)), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "tag"
        }, Liferay.Language.get('portlet-element-id'), ":"), /*#__PURE__*/_react["default"].createElement("span", {
          className: "value"
        }, props.portletElementId)), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement("span", {
          className: "tag"
        }, Liferay.Language.get('configuration'), ":"), /*#__PURE__*/_react["default"].createElement("span", {
          className: "value pre"
        }, JSON.stringify(props.configuration, null, 2))))
      );
    }
  }
});
//# sourceMappingURL=AppComponent.js.map