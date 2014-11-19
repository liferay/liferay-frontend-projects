ScriptLoader.register('aui-chema-group-test2', ['aui-plugin-base'], function(pluginBase) {
    return {
        log: function(text) {
            console.log('module aui-chema-group-test2');
        }
    };
}, {
    group: 'chema',
    path: 'aui-chema-group-test2.js'
});