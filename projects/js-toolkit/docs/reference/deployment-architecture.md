# Deployment Architecture

[Liferay Portal](https://github.com/liferay/liferay-portal) comes with a builtin
support for npm packages. The main goal of this support is to be able to use
npm modules from inside portlets with the help of the
[Liferay AMD Loader](https://www.npmjs.com/package/@liferay/amd-loader). This
includes a standard npm based development workflow and a specific
deployment-runtime workflow that allows sharing npm packages from different
portlets and honors the semantic versioned dependencies found in `package.json`
files.

OSGi bundles containing npm packages must have a specific structure, described
in the following section.

## Structure of OSGi bundles containing npm packages

To deploy JavaScript modules to Liferay Portal you need to compose an OSGi
bundle with, at least, the following structure:

```
📂 my-bundle/META-INF/resources
    📄 package.json
        name: my-bundle-package
        version: 1.0.0
        main: lib/index
        dependencies:
            isarray: 2.0.0
            isobject: 2.1.0
        …
    📂 lib
        📄 index.js
        …
    📂 node_modules
        📂 isobject@2.1.0
            📄 package.json
                name: isobject
                version: 2.1.0
                dependencies:
                    isarray: 1.0.0
                …
            …
        📂 isarray@1.0.0
            📄 package.json
                name: isarray
                version: 1.0.0
                …
            …
        📂 isarray@2.0.0
            📄 package.json
                name: isarray
                version: 2.0.0
                …
            …
        …
    …
```

This allows you to deploy an inline JavaScript package (named
`my-bundle-package` in this case) and several npm packages which must be placed
inside a `node_modules` folder, one package per folder.

The inline package must be directly placed under the OSGi's standard
`META-INF/resources` folder and is defined by a standard npm `package.json`
file.

The packages inside `node_modules` have the same internal format followed by
the npm tool and can be, in fact, copied (after, maybe, a little processing)
from a standard `node_modules` folder. You can place as many npm packages as
you want in the `node_modules` folder even different versions of the same
package. You can also place none.

Note, however, that in this case all the packages are at the same level and
have a trailing `@x.y.z` suffix to acomodate different versions. That is not
the case when you run `npm` where packages can be nested inside each others.

Regarding the inline package, it can be present or absent too, though only one
inline package per OSGi bundle may appear. This inline package is normally used
to provide the JavaScript code for a portlet when the OSGi bundle contains one,
but the architecture does not make any difference between inline and npm
packages once they are published after being scanned. It is just a mechanism to
organize OSGi bundles in a more understandable way.

## AMDization of JavaScript modules

Given that
[Liferay AMD Loader](https://www.npmjs.com/package/@liferay/amd-loader) follows
the [AMD specification](https://github.com/amdjs/amdjs-api/blob/master/AMD.md),
all modules inside an npm OSGi bundle must be in AMD format but usually modules
inside npm packages are in
[CommonJS format](https://nodejs.org/api/modules.html). However, they can be
easily converted to AMD by wrapping the module code inside a `define()` call.

Let's see an example with `isobject@2.1.0` package. This package has a main
module called `index.js` which contains the following code:

```javascript
'use strict';

var isArray = require('isarray');

module.exports = function isObject(val) {
	return val != null && typeof val === 'object' && isArray(val) === false;
};
```

This is clearly a CommonJS module, so we need to AMDify it before copying it to
the `node_modules/isarray@2.1.0` folder. To do that, we simply wrap it inside
an AMD `define` call like the following:

```javascript
define('isobject@2.1.0/index', ['module', 'require', 'isarray'], function (
	module,
	require
) {
	'use strict';

	var isArray = require('isarray');

	module.exports = function isObject(val) {
		return val != null && typeof val === 'object' && isArray(val) === false;
	};
});
```

> 👀 Note that we are naming the module upon its package, version, and file's
> path: 'isobject@2.1.0/index'. This is not a requisite of the AMD
> specification, but it is a convention needed for the Liferay AMD Loader to
> find it.

We then need to specify its dependencies: `['module', 'require', 'isarray']`.

The first two are always needed to get a reference to the `module.exports`
object and the local `require()` function as defined in the AMD specification.

The following dependencies just state the modules on which this module depends.
Note that `isarray` is not a package, but an alias of the main module of
`isarray` package (thus, it is equivalent to `isarray/index`).

Also note that Liferay has enough information in the `package.json` files to
not only know that `isarray` refers to `isarray/index`, but also that it must
be resolved to version `1.0.0` of such package, i.e., that `isarray/index` in
this case, refers to `isarray@1.0.0/index`.

In case you are wondering how to AMDifiy your modules, you can leverage
[liferay-npm-bundler](https://github.com/liferay/liferay-frontend-projects/tree/master/maintenance/projects/js-toolkit/packages/liferay-npm-bundler)
to do that for you 😉.
