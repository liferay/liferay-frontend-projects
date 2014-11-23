Loader.register('aui-nate', ['aui-autocomplete', 'aui-event'], function(node, pluginBase) {
	AUI.Utils.assertValue(node);
    AUI.Utils.assertValue(pluginBase);

    return {
        log: function(text) {
            console.log('module aui-nate: ' + text);
        }
    };
}, {
	path: 'aui-nate.js'
});