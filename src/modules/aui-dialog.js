Loader.register('aui-dialog', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    AUI.Utils.assertValue(node);
    AUI.Utils.assertValue(pluginBase);

    return {
        log: function(text) {
            console.log('module aui-dialog: ' + text);
        }
    };
}, {
	condition: {
        trigger: 'aui-nate',
        test: function() {
            return true;
        }
    },
    path: 'aui-dialog.js'
});