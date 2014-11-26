Loader.register('aui-chema-group-test2', ['aui-plugin-base'], function (pluginBase) {
    assertValue(pluginBase);

    return {
        log: function (text) {
            console.log('module aui-chema-group-test2: ' + text);
        }
    };
}, {
    group: 'chema',
    path: 'aui-chema-group-test2.js'
});