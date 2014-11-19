ScriptLoader.register('aui-core', [], function() {
    return {
        log: function(text) {
            console.log('module aui-core');
        }
    };
}, {
    path: 'aui-core.js'
});