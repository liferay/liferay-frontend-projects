Loader.register('aui-ambrin-group-test3', ['aui-base', 'aui-core'], function(base, core) {
	AUI.Utils.assertValue(base);
	AUI.Utils.assertValue(core);

    return {
        log: function(text) {
            console.log('module aui-ambrin-group-test3: ' + text);
        }
    };
}, {
    group: 'ambrin',
    path: 'aui-ambrin-group-test3.js'
});