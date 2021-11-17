# Runtime Architecture

Once you have deployed an OSGi bundle following the steps described in the
[deployment architecture](./deployment-architecture.md), its modules are made
available for consumption through canonical URLs.

For instance, if you deploy the example OSGi bundle described
[there](./How-to-deploy-npm-packages-to-Liferay.md#structure-of-osgi-bundles-containing-npm-packages)
you will get the following URLs (one for each module):

- http://localhost/o/js/module/598/my-bundle-package@1.0.0/lib/index.js
- http://localhost/o/js/module/598/isobject@2.1.0/index.js
- http://localhost/o/js/module/598/isarray@1.0.0/index.js
- http://localhost/o/js/module/598/isarray@2.0.0/index.js

> 👀 Note that the '598' may vary and corresponds to the OSGi bundle id.

## Package deduplication

Given that two or more OSGi modules may export multiple copies of the same
package and version, Liferay needs to deduplicate such collisions. To
accomplish that a new concept named _resolved module_ is created.

A resolved module is the reference package exported to the whole Liferay
frontend when multiple copies of the same package and version exists. It is
taken from one of the several bundles exporting the same copies of the package,
in a **non deterministic way**.

In the example above, for each group of canonical URLs referring to the same
module inside different OSGi bundles, there's another canonical URL for the
resolved module. In this example, we would have:

- http://localhost/o/js/resolved-module/my-bundle-package@1.0.0/lib/index.js
- http://localhost/o/js/resolved-module/isobject@2.1.0/index.js
- http://localhost/o/js/resolved-module/isarray@1.0.0/index.js
- http://localhost/o/js/resolved-module/isarray@2.0.0/index.js

> 👀 Note how the bundle id '598' disappears and 'module' is replaced by
> 'resolved-module'.

## Per-project package isolation (new since liferay-npm-bundler 2)

The package deduplication feature was used by liferay-npm-bundler 1. It was
based on semantic versioning which, even being formally correct, led to
divergencies from the standard webpack et al. solutions that caused some setups
to fail or be unstable (specially when several versions of the same frameworks
were mixed in a single page).

To revert that situation, liferay-npm-bundler 2 prevents package deduplication
by namespacing each bundle's packages so that they don't collide and, thus,
deduplication can't take place. This, in fact, is equivalent to using
Browserify or webpack because you don't get any deduplication so, if you are
not willing to deduplicate any package, you may as well use Browserify or
webpack directly.

However, if you are willing to deduplicate packages, with liferay-npm-bundler 2
you can tweak what to deduplicate and what to isolate per bundle, giving you a
more fine grained solution compared to version 1.

To use the new deduplication paradigm you just need to put all your shared
packages in their own OSGi bundle and then import them from your projects using
the `imports` section of the `.npmbundlerrc` file.

Please refer to these three blog posts to get more in-depth information on the
_namespacing_ and _imports_ technique:

1. https://web.liferay.com/web/ivan.zaera/blog/-/blogs/why-we-need-a-new-liferay-npm-bundler-1-of-3-
2. https://web.liferay.com/web/ivan.zaera/blog/-/blogs/why-we-need-a-new-liferay-npm-bundler-2-of-3-
3. https://web.liferay.com/web/ivan.zaera/blog/-/blogs/why-we-need-a-new-liferay-npm-bundler-3-of-3-

## Advanced topic: How Liferay AMD Loader configuration is exported

> 👀 This chapter is targeted at advanced users that know how Liferay AMD
> Loader works under the hood.

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

1. The paths to the JavaScript module files are described inside the
   `Liferay.PATHS` section.
2. The dependency names and version of each module are described inside the
   `Liferay.MODULES` section.
3. The aliases of the package's main modules are described inside the
   `Liferay.MAPS` section.

So, with the canonical module URLs, canonical resolved module URLs, and Loader
configuration exported by Liferay, we do have enough information in the browser
to make Liferay work as an NPM registry and correctly link npm modules in the
browser at runtime.
