ScriptLoader.register('aui-test2', ['aui-base'], function(base) {
    return {
        log: function(text) {
            console.log('module aui-test2');
        }
    };
}, {
    condition: {
        trigger: 'aui-plugin-base',
        test: function() {
            return true;
        }
    },
    path: 'aui-test2.js'
});