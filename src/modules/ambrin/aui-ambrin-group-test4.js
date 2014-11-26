Loader.register('aui-ambrin-group-test4', ['aui-node'], function (node) {
    assertValue(node);

    return {
        log: function (text) {
            console.log('module aui-ambrin-group-test4: ' + text);
        }
    };
}, {
    group: 'ambrin',
    path: 'aui-ambrin-group-test4.js'
});