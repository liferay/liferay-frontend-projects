Loader.register('aui-test2', ['aui-base'], function (base) {
    assertValue(base);

    return {
        log: function (text) {
            console.log('module aui-test2: ' + text);
        }
    };
}, {
    condition: {
        trigger: 'aui-plugin-base',
        test: function () {
            return true;
        }
    },
    path: 'aui-test2.js'
});