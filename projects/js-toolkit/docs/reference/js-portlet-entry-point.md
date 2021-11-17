# JavaScript Portlet Entry Point

This document describes the _contract_ between the JS Portlet Extender and the
portlet.

Once the extender detects a JS-extended portlet, it looks for its `main` entry
of `package.json` and imports that module assuming that it exports (as default)
a function with the following signature:

```javascript
function entryPoint({
	configuration,
	contextPath,
	portletElementId,
	portletNamespace,
}) {
	// function body
}
```

As shown, the function receives a single object with several fields:

- **configuration**: this field contains the system (OSGi) and portlet instance
  (preferences as described in the Portlet spec) configuration associated to
  the portlet. It has two subfields:
	- **system**: contains the system level configuration (defined in
	  `Control Panel > System Settings`)
    - **portletInstance**: contains the per-portlet configuration (defined in
	  the `Configuration` menu option of the portlet)
- **contextPath**: the path to the web context of the module to be able to
  download static resources. It does not contain server, protocol or port
  parts, just the path portion of the URL (i.e. something like
  `/o/my-portlet`).
- **portletElementId**: the id of the DOM node where the portlet's UI must be
  rendered.
- **portletNamespace**: the portlet namespace as defined in the portlet
  specification.

> 👀 Note that all configuration values are received as strings, no matter what
> their underlying type is in the definition.
