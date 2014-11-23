Loader.register('aui-chema-group-test1', ['aui-base', 'aui-core'], function(base, core) {
	AUI.Utils.assertValue(base);
	AUI.Utils.assertValue(core);

    return {
        log: function(text) {
            console.log('module aui-chema-group-test1: ' + text);
        }
    };
}, {
    group: 'chema',
    path: 'aui-chema-group-test1.js'
});