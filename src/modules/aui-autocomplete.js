Loader.register('aui-autocomplete', ['aui-node', 'aui-dialog'], function(node, dialog) {
	AUI.Utils.assertValue(node);
	AUI.Utils.assertValue(dialog);

    return {
        log: function(text) {
            console.log('module aui-autocomplete: ' + text);
        }
    };
}, {
	path: 'aui-autocomplete.js'
});