Loader.register('aui-node', ['aui-base', 'aui-core'], function(base, core) {
	AUI.Utils.assertValue(base);
    AUI.Utils.assertValue(core);

    return {
        log: function(text) {
            console.log('module aui-node: ' + text);
        }
    };
}, {
    path: 'aui-node.js'
});