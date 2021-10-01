(function () {
  var link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", Liferay.ThemeDisplay.getPathContext() + "/o/test-project-1.0.0/css/styles.css");

  function defineModule() {
    Liferay.Loader.define("test-project@1.0.0/css/styles.scss", ['module', 'exports', 'require'], function (module, exports, require) {
      var define = undefined;
      var global = window;
      {
        module.exports = link;
      }
    });
  }

  link.onload = defineModule;

  link.onerror = function () {
    console.warn('Unable to load /o/test-project-1.0.0/css/styles.css. However, its .js module will still be defined to avoid breaking execution flow (expect some visual degradation).');
    defineModule();
  };

  document.querySelector("head").appendChild(link);
})();
//# sourceMappingURL=styles.scss.js.map