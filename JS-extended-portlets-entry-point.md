Since the introduction of the [create-jar option](https://github.com/liferay/liferay-npm-build-tools/issues/164) in the bundler, the developer can write 100% Javascript portlets that are bootstrapped from the [JS Portlet Extender](https://web.liferay.com/en/marketplace/-/mp/application/115542926) in the server. 

This document describes the _contract_ between the JS Portlet Extender and the portlet.

Once the extender detects a JS-extended portlet, it looks for its `main` entry of `package.json` and imports that module assuming that it exports (as default) a function with the following signature:

```javascript
function entryPoint({portletElementId, contextPath, portletNamespace, configuration}) {
    // function body
}
```

As shown, the function receives a single object with several fields:

* **portletElementId**: the id of the DOM node where the portlet's UI must be rendered.
* **contextPath**: the path to the web context of the module to be able to download static resources. It does not contain server, protocol or port parts, just the path portion of the URL (i.e. something like `/o/my-portlet`).
* **portletNamespace**: the portlet namespace as defined in the portlet specification.
* **configuration** `since JS Portlet Extender 1.1.0`: this field contains the OSGi configuration associated to the bundle. If no configuration is defined it will be an empty object.
