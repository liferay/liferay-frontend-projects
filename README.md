Simplified YUI like Loader
=====

Supports JavaScript modules only, but with groups, combo url and conditional loading.

How to build it?
-------------

1. Clone or fork the repository on your machine.
2. Install NodeJS.
3. Install Gulp `[sudo] npm install -g gulp`.
4. Run `npm install` in the cloned/forked repository.
5. Run `gulp` to build it.

This will build the loader in 'dist' directory.

How to run the demo?
-------------
1. The default configuration and the demo require a combo loader. Go to the folder, where you cloned the loader, then run `node combo.js`. This will run a combo handler on port 3000.
2. Download [mongoose](https://github.com/cesanta/mongoose) or if you have brew just do `brew install mongoose`, then navigate to Loader folder and run mongoose with the following params:
    `mongoose -listening_port 8081 -document_root dist`.
3. Open a browser, for example Chrome and load  `index.html` page from dist folder. Open the console and look for the messages. You will see that resouces are being loaded.

Loader features
======

1. Supports groups.
2. Supports combo loading of the resources.
3. Supports conditional loading.
4. The configuration can be auto generated.

Registering modules
======

```javascript```
Loader.register('aui-dialog', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-dialog: ' + text);
        }
    };
}, {
	condition: {
        trigger: 'aui-test',
        test: function() {
            return true;
        }
    },
    path: 'aui-dialog.js'
});
```

You can also register modules using `define` function, it is just an alias of `Loader.register`:

```javascript```
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
            return true;
        }
    },
    path: 'aui-dialog.js'
});
```

Loading modules
======

There are two ways to load modules - using Promises or callback functions (AMD style).

Loading modules using Promises:

```javascript```
Loader.import('aui-node', 'aui-autocomplete', 'aui-ambrin-group-test3')
      .then(function(modules) {
          modules[0].log('test');
      }).catch(function(error) {
          console.error(error);
      });
```

Loading modules using callbacks:

```javascript```
Loader.require('aui-base', 'aui-test', function(base, test) {
	    // your code here
	}, function(error) {
	    console.error(error);
	});
```

There is also an alias of `Loader.require`, which is just `require`. The code below will work too:
```javascript```
require('aui-base', 'aui-test', function(base, test) {
	    // your code here
	}, function(error) {
	    console.error(error);
	});
```

Automatically generating the configuration
======

In order to generate the configuration, there is a small NodeJS program, called `config-generator`. You may use it to generate the configuration like this:
```bash```
$ node config-generator.js -c src/config/config-base.json -o src/config/config.js src/modules
```

My advice is to create a separate, base config file and pass it to the config generator as in the code above. In the base file you may define the groups, the URLs, combine flags, etc. and then leave config generator to add the rest.
Look on the example modules and the demo for more information. Then, just load the generated configuration to the browser and the Loader will do the rest.

What it does not support from YUI Loader?
======

There are no CSS modules, I can't think for anything else right now.


Roadmap
======

1. Do 100% code coverage (this is work in progress).


Enjoy!

