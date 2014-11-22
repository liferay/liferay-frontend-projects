Loader.register('aui-event', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
	AUI.Utils.assertValue(node);
    AUI.Utils.assertValue(pluginBase);

    return {
        log: function(text) {
            console.log('module aui-event: ' + text);
        }
    };
}, {
	path: 'aui-event.js'
});