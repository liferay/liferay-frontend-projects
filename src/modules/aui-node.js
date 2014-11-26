Loader.register('aui-node', ['aui-base', 'aui-core'], function (base, core) {
    assertValue(base);
    assertValue(core);

    return {
        log: function (text) {
            console.log('module aui-node: ' + text);
        }
    };
}, {
    path: 'aui-node.js'
});