ScriptLoader.register('aui-autocomplete', ['aui-node', 'aui-dialog'], function(node, dialog) {
    return {
        log: function(text) {
            console.log('module aui-autocomplete');
        }
    };
}, {
	path: 'aui-autocomplete.js'
});