"use strict";

Liferay.Loader.define("test-project@1.0.0/index", ['module', 'exports', 'require', 'liferay!frontend-js-react-web$react', 'liferay!frontend-js-react-web$react-dom', './AppComponent'], function (module, exports, require) {
  var define = undefined;
  var global = window;
  {
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports["default"] = main;

    var _react = _interopRequireDefault(require("liferay!frontend-js-react-web$react"));

    var _reactDom = _interopRequireDefault(require("liferay!frontend-js-react-web$react-dom"));

    var _AppComponent = _interopRequireDefault(require("./AppComponent"));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }

    /**
     * This is the main entry point of the portlet.
     *
     * See https://tinyurl.com/js-ext-portlet-entry-point for the most recent 
     * information on the signature of this function.
     *
     * @param  {Object} params a hash with values of interest to the portlet
     * @return {void}
     */
    function main(_ref) {
      var portletNamespace = _ref.portletNamespace,
          contextPath = _ref.contextPath,
          portletElementId = _ref.portletElementId,
          configuration = _ref.configuration;

      _reactDom["default"].render( /*#__PURE__*/_react["default"].createElement(_AppComponent["default"], {
        portletNamespace: portletNamespace,
        contextPath: contextPath,
        portletElementId: portletElementId,
        configuration: configuration
      }), document.getElementById(portletElementId));
    }
  }
});
//# sourceMappingURL=index.js.map