ScriptLoader.register('aui-nate', ['aui-autocomplete', 'aui-event'], function(node, pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-event');
        }
    };
}, {
	group: 'ambrin',
	path: 'aui-event.js'
});