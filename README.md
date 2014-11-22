Simplified YUI like Loader
=====

Supports JavaScript modules only, but with groups, combo url and conditional loading.

How to build it?
-------------

1. Clone or fork the repository on your machine.
2. Install NodeJS and then in the cloned/forked repository run 'npm install'.

This will build the loader in 'dist' directory.

How to run de demo?
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

Loading modules
======
```javascript```
Loader.import('aui-node', 'aui-autocomplete', 'aui-ambrin-group-test3')
      .then(function(modules) {
          modules[0].log('test');
      }).catch(function(error) {
          console.error(error);
      });
```

What it does not support from YUI Loader?
======

There are no CSS modules, I can't think for anything else right now.


Roadmap
======

1. Create a parser in order to generate the configuration automatically.
2. Do 100% code coverage.


Enjoy!

