var test123 = 0;


Loader.register('aui-chema', ['aui-autocomplete', 'aui-event', 'aui-node'], function(autocomplete, event_, node) {
    AUI.Utils.assertValue(autocomplete);
    AUI.Utils.assertValue(event_);
    AUI.Utils.assertValue(node);

    window.chema = {
        log: function(text) {
            autocomplete.log('Module chema now logs something from autocomplete\'s log');

            console.log('module aui-chema: ' + text);
        }
    };

    return window.chema;
}, {
	condition: {
        trigger: 'aui-nate',
        test: function() {
            var el = document.createElement('input');

            return ('placeholder' in el);
        }
    },
    path: 'aui-chema.js'
});