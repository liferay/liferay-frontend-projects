Loader.register('aui-dom-node', ['aui-node'], function (node) {
    assertValue(node);

    return {
        log: function (text) {
            console.log('module aui-dom-node: ' + text);
        }
    };
}, {
    path: 'aui-dom-node.js'
});