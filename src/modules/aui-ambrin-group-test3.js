ScriptLoader.register('aui-ambrin-group-test3', ['aui-base', 'aui-core'], function(base, core) {
    return {
        log: function(text) {
            console.log('module aui-ambrin-group-test3');
        }
    };
}, {
    group: 'ambrin',
    path: 'aui-ambrin-group-test3'
});