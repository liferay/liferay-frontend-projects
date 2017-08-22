# babel-plugin-shim-nodejs

> Transform server side code to use Node.js shims for the browser.

## Example

**In**

```javascript
var console = require('console');

console.info('Hello from '+__filename);
```

**Out**

```javascript
var __filename = 'index.js';
var console = require('liferay-node-console');

console.info('Hello from '+__filename);
```

## Installation

```sh
npm install --save-dev babel-plugin-shim-nodejs
```

## Usage

Add the following to your `.babelrc` file:

**Without options:**
```json
{
  "plugins": ["shim-nodejs"]
}
```

**With options:**
```json
{
  "plugins": [
    ["shim-nodejs", {
        "nodeShimsVersion": "1.5.0",
        "globals": {
            "process": "var process = {env: {NODE_ENV: 'production'}}};"
        },
        "modules": {
        }
    }]
  ]
}
```

## Technical Details and Options

This plugins transforms as much as possible Node.js server code to make it work
in the browser by using shims. 

It assumes that you have deployed 
[frontend-js-node-shims](https://github.com/liferay/liferay-portal/tree/master/modules/apps/foundation/frontend-js/frontend-js-node-shims)
OSGi bundle to your Portal (the bundle is shipped with standard installations 
by default). 

Failure to deploy such bundle will result in Javascript errors due to missing 
modules.

The plugin supports rewriting of all Node.js v8 globals and builtin modules to 
make them use the shims. This does not necessarily mean that all server code 
will work, just that it will try to use the shims, but the shims may not be
deployed or may be incomplete. 

Consider, for example, that there's no way to fully shim Node.js's 
`child_process` module in a browser (in a standard way) so that all npm packages 
using it may work correctly in the browser.

The usual way to shim globals is to look for their appearance as lone 
identifiers and prepend a variable declaration for the global on top of the 
module.

On the other hand, the usual way to shim modules is to rewrite the `require()`
calls to prepend the `liferay-node-` prefix to the module name so that the 
deployed shim is loaded instead of failing with a missing module exception.

Of course, if `liferay-node-*` modules are required after transformation, the
transformed package's `package.json` file must be patched to inject a dependency
to the `liferay-node-*` packages. This is also automatically done by the plugin.

This plugin has several configuration options that can be tweaked to support 
more globals and/or modules:

* **nodeShimsVersion**: by default set to `1.0.0`, it specifies the version to 
use when patching `package.json` files.
* **globals**: holds a map specifying what lines should be prepended to the 
module code when global identifiers are found in the transformed code. By 
default it maps Node.js v8 globals to a suitable shimmed value (see
[globals.js](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/babel-plugin-shim-nodejs/src/node/globals.js) for a more detailed description).
* **modules**: holds a map specifying how builtin module names should be 
rewritten. By default it maps Node.js v8 builtin modules to their name prepended
by `liferay-node` (see [modules.js](https://github.com/liferay/liferay-npm-build-tools/blob/master/packages/babel-plugin-shim-nodejs/src/node/modules.js) for a more detailed description).