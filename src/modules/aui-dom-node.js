ScriptLoader.register('aui-dom-node', ['aui-node'], function(node) {
    return {
        log: function(text) {
            console.log('module aui-dom-node');
        }
    };
}, {
	path: 'aui-dom-node.js'
});