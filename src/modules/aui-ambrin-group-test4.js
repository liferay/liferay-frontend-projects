ScriptLoader.register('aui-ambrin-group-test4', ['aui-node'], function(node) {
    return {
        log: function(text) {
            console.log('module aui-ambrin-group-test4');
        }
    };
}, {
    group: 'ambrin',
    path: 'aui-ambrin-group-test4'
});