AMD Module Loader
=====

[![Build Status](https://travis-ci.org/liferay/liferay-amd-loader.svg)](https://travis-ci.org/liferay/liferay-amd-loader)

Supports loading modules via combo URL. Modules can be loaded automatically when some other module is being triggered, but only if some condition is met.

___Note:___ Loading anonymous modules via combo URL is not possible. If some of the modules is anonymous and `combine` is set to `true`, the module should be registered and `anonymous` property to be set as `true`. In this way this module will be excluded from the combo URL and a separate `script` element will be created for it. If `combine` is set to `false`, describing the module is not needed.

How to build it?
-------------

1. Clone or fork the repository on your machine.
2. Install NodeJS.
3. Install Gulp `[sudo] npm install -g gulp`.
4. Run `npm install` in the cloned/forked repository.
5. Run `gulp` to build it.

This will build the loader in 'dist' directory. There will be two versions:
- loader.js - which comes with ES6 Promise [polyfill]((https://github.com/jakearchibald/es6-promise))
- loader-pure.js - version without Promise polyfill. If you already have Promise polyfill in your project or you are only targeting browsers which support Promises natively, use this version.

Both versions have minified versions too.

How to run the demo?
-------------
1. The default configuration and the demo require a combo loader. Go to the folder, where you cloned the loader, then run `node combo.js`. This will run a combo handler on port 3000.
2. Run start script:
    `npm run start`.
3. Open a browser, for example Chrome and load  `http://localhost:8080/`. Open the console and look for the messages. You will see that resouces are being loaded.

Loader features
======

1. Supports combo loading of the resources.
3. Supports conditional loading.
4. The configuration can be auto generated.

Registering modules
======

Use `define` function:

```javascript
define('aui-dialog', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-dialog: ' + text);
        }
    };
});
```

You may specify that the module should be loaded on triggering some other module and only of some condition is being met:

```javascript
define('aui-dialog', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-dialog: ' + text);
        }
    };
}, {
    condition: {
        trigger: 'aui-test',
        test: function() {
            var el = document.createElement('input');

            return ('placeholder' in el);
        }
    },
    path: 'aui-dialog.js'
});
```

Here it is specified, that this module should be loaded automatically if developer requests 'aui-test' module, but only if some condition is being met.

Using ES6 syntax in your modules
======

```javascript
'use strict';

import {log as logBase} from 'aui-base';
import {log as logCore} from 'aui-core';
import {log as logEvent} from 'aui-event';

function log(text) {
    logEvent('module aui-dialog says via aui-event: ' + text);
    logBase('in module aui-dialog logBase is available: ' + text);
    logCore('in module aui-dialog logCore is available: ' + text);
}

export {log};

/**
 * The code below is meta configuration, in this case it includes module condition only.
 * You may delete the whole function statement if you don't need it.
 */
(function META() {
    return {
        condition: {
            test: function() {
                return true;
            },
            trigger: 'nate'
        },
        path: 'nate.js'
    };
});


/**
 * There is another way to define META. Liferay Config Generator recognizes both.
 * It is up to you to choose one.
 */
META: ({
    condition: {
        test: function() {
            return true;
        },
        trigger: 'nate'
    },
    path: 'nate.js'
});
```
Transpile the above using [Babel](https://babeljs.io/) to AMD syntax. If you transpile using Babel, be sure you added the option for generating module IDs, or you use [Liferay AMD modules config generator](https://www.npmjs.com/package/liferay-module-config-generator), which will generate the module name in "define" function, if not already available.

Loading modules
======

Use `require` method:
```javascript
require('aui-base', 'aui-test', function(base, test) {
	    // your code here
	}, function(error) {
	    console.error(error);
	});
```

Mapping paths
======
You can map parts of module's path with another value and the path will be replaced accordingly. Example:

```
__CONFIG__.paths = {
    'jquery': 'http://code.jquery.com/jquery-2.1.3.min.js',
    'aui': 'html/js'
};
```

In this case a module, specified as "jquery" will be loaded from "http://code.jquery.com/jquery-2.1.3.min.js" and a module, specified as "aui/loader.js" will be loaded from:<br>
URL + basePath + "html/js/loader.js" where URL and basePath will be retrieved from config.js. Here is an exaple:<br>
If the URL is "http://localhost:3000/modules" and basePath is "/base", the final path will look like this:
"http://localhost:3000/modules/base/html/js/loader.js"

The Loader also supports an `*` as key in the `paths` configuration. The value should be a function, which will receive the module as an argument and the returned value will be used as a path for this module. The `*` has lower precedence than a specific key for a given module. Example:

```javascript
__CONFIG__ = {
    paths: {
        '*': function(module) {
            return 'https://rawgit.com/bkardell/gaps/master/' + module + '.js';
        }
    }
};
```

Mapping module names
======
You can map module names. Example:

```
__CONFIG__.maps = {
    'liferay': 'liferay@1.0.0',
    'liferay2': 'liferay@1.0.0'
};
```

Mapping a module will change its name in order to match the value, specified in the map. Examples:

```
require('liferay/html/js/autocomplete'...)
```

Under the hood, it will be the same as if the user specified:

```
require('liferay@1.0.0y/html/js/autocomplete'...)

```

Module mapping works in module dependencies too:

```
define('liferay@2.0.0', ['exports', 'liferay/test.js'], function (__exports__, liferay) {
    'use strict';

    function log(text) {
        console.log('liferay@2.0.0 says', text);
    }

    __exports__.log = log;
});
```

The module 'liferay/test.js' in the dependencies will be transparently changed to:

```
'liferay@1.0.0/test.js'
```


The Loader also supports an `*` as key in the `maps` configuration. The value should be a function, which will receive the module as an argument and the returned value will be used as the new module name. The `*` has lower precedence than a specific key for a given module. Example:

```javascript
__CONFIG__ = {
    maps: {
        '*': function(module) {
            if (module.indexOf('@') === -1) {
                module += '@1.0';
            }

            return module;
        }
    }
};
```

Passing default URL parameters
======
Arbitrary URL parameters might be added to each module request. The parameter will be added to all kind of requests - for modules with external or absolute path, anonymous and in case of combined modules.
To achieve that, you may specify the parameters in `defaultURLParams` configuration property:
```javascript
{
    'url': 'http://localhost:3000/modules?',
    'defaultURLParams': {
        'languageId': 'en_US'
    }
}
```
In this case, `languageId` with value 'en_US' will be added to each module request and the result might look like this:
`http://localhost:3000/modules?/base/foo.js&/base/bar.js&languageId=en_US`

Loading modules via combo URL
======
In order to load the modules via combo URL, a special config file have to be created first. You can do that manually or using a special tool, which comes together with the loader. It is called `config-generator`. See the next section for more details:

Automatically generating the configuration
======

In order to generate the configuration, there is a separate project, called [Liferay AMD modules config generator](https://www.npmjs.com/package/liferay-module-config-generator). You may use it to generate the configuration file automatically.

Here is an example usage:

```bash
$ lfr-cfgen -b src/config/config-base.js -o src/config/config.js src/modules
```

A preferable way to work with the loader would be to generate a separate, base config file and pass it to the config generator as in the code above. In the base file you may define the URLs, combine flags, etc. and then leave config generator to add the modules.
Look on the example modules and the demo for more information. Then, just load the generated configuration to the browser and the Loader will do the rest.

Reporting errors caused mismatched anonymous modules
======
By default mismatched anonymous modules will be reported by throwing an exception. This is configurable and there is a property:
```javascript

// By default, `reportMismatchedAnonymousModules` is not set and
// in this case the loader will throw an exception

// Throw an exception
__CONFIG__.reportMismatchedAnonymousModules = 'exception';

// Log the error using console.log
__CONFIG__.reportMismatchedAnonymousModules = 'log';

// Log the error using console.info
__CONFIG__.reportMismatchedAnonymousModules = 'info';

// Log the error using console.warn
__CONFIG__.reportMismatchedAnonymousModules = 'warn';

// Log the error using console.error
__CONFIG__.reportMismatchedAnonymousModules = 'error';

// Ignore the error
__CONFIG__.reportMismatchedAnonymousModules = 'off';
```

Namespacing the Loader
======
Setting `namespace` property of the config to a value as a string will expose the Loader to this variable, instead directly to window. For example, if `namespace` is set to "VM", the Loader will be available as `window.VM.Loader`.

Exposing Loader globally
======
Setting `exposeGlobal` property of the config will expose the Loader to the window, among with the `define` and `require` functions. By default the value of this property is true. For example, there will be `window.Loader`, `window.require` and `window.define` methods in case `exposeGlobal` is unset or set to true. Otherwise, these will be undefined.

Ignoring module versions
======
Setting `ignoreModuleVersion` property of the config will ignore the `@major.minor.path` version qualifier in a module name to allow for a more lenient module name match in scenarios where undisclosed security vulnerabilities can lead to a security leak if versions are exposed to the
loader configuration.