# liferay-npm-build-tools

[![Build Status](https://travis-ci.org/liferay/liferay-npm-build-tools.svg?branch=master)](https://travis-ci.org/liferay/liferay-npm-build-tools)

## Setup

1. Install NodeJS >= [v6.11.0](http://nodejs.org/dist/v6.11.0/), if you don't 
have it yet.

2. Run the bootstrap script to install local dependencies and link packages 
together:

  ```sh
  npm run lerna
  ```

3. Build all packages

  ```sh
  npm run build
  ```

4. Run tests:

  ```sh
  npm run test
  ```

## How to use

This repository hosts several Babel plugins and some other tools needed to 
deploy npm based project on Liferay Portal. Each plugin has its own README
with its details, but the whole setup of an npm based project will be explained 
here.

To begin with, you can leverage 
[blade](https://github.com/liferay/liferay-blade-samples) to create an empty
portlet. Please refer to blade's documentation on how to do so.

Once you have created a portlet project, just head up to 
`src/main/resources/META-INF/resources` folder (the place where all web 
resources are placed) and begin using npm as you would do in a normal project.

When you are ready to deploy your portlet, edit your `package.json` file and 
configure a `build` script with the commands needed to build your project. You
can use any languages you like as long as they can be transpiled to 
Ecmascript 5 or higher (the specific requisite is that Babel can process it and
your browser can execute it). The build script will be run when you deploy your 
portlet to the Portal using gradle.

After everything is transpiled (if necessary) to Ecmascript in your build 
script, you must run the
[liferay-npm-bundler](https://github.com/liferay/liferay-npm-build-tools/tree/master/packages/liferay-npm-bundler) 
tool to pack the needed npm packages and transform them to AMD so that 
[Liferay AMD Loader](https://github.com/liferay/liferay-amd-loader) may grab 
them from the Portal.

In essence, `liferay-npm-bundler` is a bundler (like webpack or browserify) that
targets Liferay Portal as platform and assumes that you will be using your npm
packages from portlets (as opposed to pure web applications). 

The peculiarity of running npm packages inside portlets makes the workflow a bit
different from standard bundlers (like browserify or webpack) because in this 
scenario you cannot just bundle all needed Javascript in a single file, but 
instead you must "link" all packages together in the browser when the full web 
page is assembled so that different portlets may share versions of modules 
instead of each one loading its own copy. That's where `liferay-npm-bundler` 
comes in handy.

You may read more about `liferay-npm-bundler` in the 
[project's README file](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/liferay-npm-bundler/README.md).

You may read more about the technical details of OSGi bundles containing npm 
packages in the following section.

## Deploying npm packages to Liferay Portal

Liferay Portal comes with a builtin support for npm packages. The main goal of
this support is to be able to use npm modules from inside portlets with the help
of Liferay AMD Loader. This includes a standard npm based development workflow 
and a specific deployment-runtime workflow that allows sharing npm packages from 
different portlets and honors the semantic versioned dependencies found in 
`package.json` files.

OSGi bundles containing npm packages must have a specific structure, described
in the following chapter.

### Structure of OSGi bundles containing npm packages

To deploy Javascript modules to Liferay Portal you need to compose an OSGi 
bundle with, at least, the following structure:

```
📂 my-bundle
  📂 META-INF
    📂 resources
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
```

This allows you to deploy an inline Javascript package (named 
`my-bundle-package` in this case) and several npm packages which must be placed
inside a `node_modules` folder, one package per folder.

The inline package must be directly placed under the OSGi's standard
`META-INF/resources` folder and is defined by a standard npm `package.json` 
file.

The packages inside `node_modules` have the same format followed by the npm tool 
and can be, in fact, copied (after, maybe, a little processing) from a standard `node_modules` folder. You can place as many npm packages as you want in the
`node_modules` folder even different versions of the same package. You can also
place none. 

Regarding the inline package, it can be present or absent too, though only one 
inline package per OSGi bundle may appear. This inline package is usually used 
to provide the Javascript code for a portlet when the OSGi bundle contains one, 
but the architecture does not make any difference between inline and npm 
packages once they are published after being scanned. It is just a mechanism to 
organize OSGi bundles in a more understandable way.

### AMDization of Javascript modules

Given that Liferay Loader is based on the AMD specification, all modules inside 
an npm OSGi bundle must be in AMD format. This can be easily done for CommonJS 
modules by wrapping the module code inside a `define` call.

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
the `node_modules/isarray@2.1.0` folder. To do that, we simply wrap it inside an 
AMD `define` call like the following:

```javascript
define(
    'isobject@2.1.0/index', 
    ['module', 'require', 'isarray'], 
    function (module, require) {
        'use strict';

        var isArray = require('isarray');

        module.exports = function isObject(val) {
            return val != null && typeof val === 'object' && isArray(val) === false;
        };
    }
);
```

**⚠ Note that we must name the module upon its package, version, and file's 
path: `isobject@2.1.0/index`, otherwise the Loader will not find it.**

We then need to specify its dependencies: `['module', 'require', 'isarray']`. 

The first two are always needed to get a reference to the `module.exports` 
object and the local `require` function as defined in the AMD specification. 

The following dependencies just state the modules on which this module depends. 
Note that `isarray` is not a package, but an alias of the main module of 
`isarray` package (thus, it is equivalent to `isarray/index`).

Also note that the Portal has enough information in the `package.json` files to 
not only know that `isarray` refers to `isarray/index`, but also that it must be 
resolved to version `1.0.0` of such package, i.e., that `isarray/index` in this 
case, refers to `isarray@1.0.0/index`.

You can leverage 
[liferay-npm-bundler](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/liferay-npm-bundler) 
to AMDify your npm modules.

## How Liferay Portal publishes npm packages

Once you have deployed an OSGi bundle with the specified structure, its modules 
are made available for consumption through canonical URLs. For instance, if we 
deploy the example OSGi bundle described in the **Structure of OSGi bundles 
containing npm packages** section we will get the following URLs (one for each 
module):

* http://localhost/o/js/module/598/my-bundle-package@1.0.0/lib/index.js
* http://localhost/o/js/module/598/isobject@2.1.0/index.js
* http://localhost/o/js/module/598/isarray@1.0.0/index.js
* http://localhost/o/js/module/598/isarray@2.0.0/index.js

(note that the `598` may vary and corresponds to the OSGi bundle id)

### Package deduplication

Given that two or more OSGi modules may export multiple copies of the same 
package and version, the Portal needs to deduplicate such collisions. To 
accomplish that a new concept named *resolved module* is created. 

A resolved module is the reference package exported to the whole Portal frontend 
when multiple copies of the same package and version exists. It is taken from 
one of the several bundles exporting the same copies of the package, in a **non
deterministic way**.

In the example above, for each group of canonical URLs referring to the same 
module inside different OSGi bundles, there's another canonical URL for the 
resolved module. In this example, we would have:

* http://localhost/o/js/resolved-module/my-bundle-package@1.0.0/lib/index.js 
* http://localhost/o/js/resolved-module/isobject@2.1.0/index.js 
* http://localhost/o/js/resolved-module/isarray@1.0.0/index.js 
* http://localhost/o/js/resolved-module/isarray@2.0.0/index.js

Note how the bundle id `598` disappears and `module` is replaced by 
`resolved-module`.

#### Per-project package isolation (new since version 2)

The original package deduplication found in version 1 was based on semantic 
versioning which, even being formally correct, led to divergencies from the 
standard webpack et al. solutions that caused some setups to fail or be 
unstable (specially when several versions of the same frameworks were mixed in 
a single page).

To revert that situation, version 2 defaults to namespacing each bundle's 
packages so that they don't collide. This, in fact, is equivalent to using 
browserify or webpack because you don't get any deduplication so, if you are not
willing to deduplicate any package, you may as well (and we too recommend) use
browserify or webpack directly.

However, if you are willing to deduplicate packages, with version 2 you can 
tweak what to deduplicate and what to isolate per bundle, giving you a more 
fine grained solution compared to version 1. 

To use the new deduplication paradigm you just need to put all your shared 
packages in their own OSGi bundle and them import them from your projects using
the `imports` section of the `.npmbundlerrc` file.

### Advanced topic: How Liferay AMD Loader configuration is exported

**⚠ This chapter is targeted at advanced users that know how Liferay AMD Loader
works under the hood.**

With deduplication in place, we can trivially make the modules available to the 
Liferay AMD Loader in the browser by injecting some configuration in the code 
returned by the `/o/js_loader_modules` URL.

For example, for the described bundle, the following configuration would be 
published for the AMD loader to consume:

```javascript
  Liferay.PATHS = {
    ...
    'my-bundle-package@1.0.0/lib/index': '/o/js/resolved-module/my-bundle-package@1.0.0/lib/index',
    'isobject@2.1.0/index': '/o/js/resolved-module/isobject@2.1.0/index',
    'isarray@1.0.0/index': '/o/js/resolved-module/isarray@1.0.0/index',
    'isarray@2.0.0/index': '/o/js/resolved-module/isarray@2.0.0/index',
    ...
  }
  Liferay.MODULES = {
    ...
    "my-bundle-package@1.0.0/lib/index.es": {
      "dependencies": ["exports", "isarray", "isobject"],
      "map": {
        "isarray": "isarray@2.0.0", 
        "isobject": "isobject@2.1.0"
      }
    },
    "isobject@2.1.0/index": {
      "dependencies": ["module", "require", "isarray"],
      "map": {
        "isarray": "isarray@1.0.0"
      }
    },
    "isarray@1.0.0/index": {
      "dependencies": ["module", "require"],
      "map": {}
    },
    "isarray@2.0.0/index": {
      "dependencies": ["module", "require"],
      "map": {}
    },
    ...
  }
  Liferay.MAPS = {
    ...
    'my-bundle-package@1.0.0': { value: 'my-bundle-package@1.0.0/lib/index', exactMatch: true}
    'isobject@2.1.0': { value: 'isobject@2.1.0/index', exactMatch: true},
    'isarray@2.0.0': { value: 'isarray@2.0.0/index', exactMatch: true},
    'isarray@1.0.0': { value: 'isarray@1.0.0/index', exactMatch: true},
    ...
  }
```

Note how:

1. The paths to the Javascript module files are described inside the 
`Liferay.PATHS` section.
2. The dependency names and version of each module are described inside the 
`Liferay.MODULES` section.
3. The aliases of the package's main modules are described inside the 
`Liferay.MAPS` section.

### Conclusion

With the canonical module URLs, canonical resolved module URLs, and Loader 
configuration exported by the Portal, we can have enough information in the 
browser to make the Portal work as an NPM registry and correctly honor 
dependencies semantic versioning.










