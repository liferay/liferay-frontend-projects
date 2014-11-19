ScriptLoader.register('aui-chema-group-test1', ['aui-base', 'aui-core'], function(base, core) {
    return {
        log: function(text) {
            console.log('module aui-chema-group-test1');
        }
    };
}, {
    group: 'chema',
    path: 'aui-chema-group-test1'
});