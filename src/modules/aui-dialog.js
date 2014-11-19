ScriptLoader.register('aui-dialog', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-dialog');
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