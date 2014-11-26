Loader.register('aui-plugin-base', [], function () {
    return {
        log: function (text) {
            console.log('module aui-plugin-base: ' + text);
        }
    };
}, {
    path: 'aui-plugin-base.js'
});