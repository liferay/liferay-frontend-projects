Loader.register('aui-test', ['aui-base'], function(base) {
    AUI.Utils.assertValue(base);

    return {
        log: function(text) {
            console.log('module aui-test: ' + text);
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