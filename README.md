AMD Module Loader
=====

Supports loading modules via combo URL. Modules can be loaded automatically when some other module is being triggered, but only if some condition is met.

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
2. Download [mongoose](https://github.com/cesanta/mongoose) or if you have `brew` just do `brew install mongoose`, then navigate to Loader folder and run mongoose with the following params:
    `mongoose -listening_port 8080 -document_root dist`.
3. Open a browser, for example Chrome and load  `http://localhost:8080/demo/`. Open the console and look for the messages. You will see that resouces are being loaded.

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

Enjoy!

[![Build Status](https://travis-ci.org/liferay/liferay-amd-loader.svg)](https://travis-ci.org/liferay/liferay-amd-loader)
