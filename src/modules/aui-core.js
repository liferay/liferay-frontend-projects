Loader.register('aui-core', [], function () {
    return {
        log: function (text) {
            console.log('module aui-core: ' + text);
        }
    };
}, {
    path: 'aui-core.js'
});