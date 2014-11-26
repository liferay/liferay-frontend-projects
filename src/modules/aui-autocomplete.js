Loader.register('aui-autocomplete', ['aui-node', 'aui-dialog'], function (node, dialog) {
    assertValue(node);
    assertValue(dialog);

    return {
        log: function (text) {
            console.log('module aui-autocomplete: ' + text);
        }
    };
}, {
    path: 'aui-autocomplete.js'
});