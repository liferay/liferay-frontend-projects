var Plugin = A.Plugin;

/**
 * Binds an AutoCompleteList instance to a Node instance.
 *
 * @module aui-ace-editor
 * @submodule aui-ace-autocomplete-plugin
 *
 * @class A.Plugin.AceAutoCompleteList
 * @extends A.AceEditor.AutoCompleteList
 */

function ACListPlugin(config) {
    if (!config.render && config.render !== false) {
        config.render = true;
    }

    ACListPlugin.superclass.constructor.apply(this, arguments);
}

A.extend(ACListPlugin, A.AceEditor.AutoCompleteList, {}, {
    CSS_PREFIX: 'ace-autocomplete',
    NAME: 'ace-autocomplete-plugin',
    NS: 'ace-autocomplete-plugin'
});

Plugin.AceAutoComplete = ACListPlugin;
Plugin.AceAutoCompleteList = ACListPlugin;
