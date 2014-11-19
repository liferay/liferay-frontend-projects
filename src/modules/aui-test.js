ScriptLoader.register('aui-test', ['aui-base'], function(base) {
    return {
        log: function(text) {
            console.log('module aui-test');
        }
    };
}, {
    condition: {
        trigger: 'aui-dialog',
        test: function() {
            return false;
        }
    },
    path: 'aui-test.js'
});