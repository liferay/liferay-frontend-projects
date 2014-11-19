ScriptLoader.register('aui-node', ['aui-base', 'aui-core'], function(base, core) {
    return {
        log: function(text) {
            console.log('module aui-node');
        }
    };
}, {
    path: 'aui-node.js'
});