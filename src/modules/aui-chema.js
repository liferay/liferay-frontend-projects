ScriptLoader.register('aui-chema', ['aui-autocomplete', 'aui-event', 'aui-node'], function(autocomplete, event_, node) {
    return {
        log: function(text) {
            console.log('module aui-chema');
        }
    };
}, {
	condition: {
        trigger: 'aui-nate',
        test: function() {
            return true;
        }
    },
    path: 'aui-chema.js'
});