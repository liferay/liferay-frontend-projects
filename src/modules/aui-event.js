ScriptLoader.register('aui-event', ['aui-node', 'aui-plugin-base'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-event');
        }
    };
}, {
	path: 'aui-event.js'
});