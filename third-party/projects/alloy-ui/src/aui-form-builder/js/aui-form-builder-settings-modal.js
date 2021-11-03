/**
 * The Form Builder Settings Modal Component
 *
 * @module aui-form-builder
 * @submodule aui-form-builder-settings-modal
 */

var CSS_BTN_PRIMARY = A.getClassName('btn', 'primary'),
    CSS_FIELD_SETTINGS = A.getClassName('form', 'builder', 'field', 'settings'),
    CSS_FIELD_SETTINGS_CANCEL =
        A.getClassName('form', 'builder', 'field', 'settings', 'cancel'),
    CSS_FIELD_SETTINGS_SAVE =
        A.getClassName('form', 'builder', 'field', 'settings', 'save'),
    CSS_MODAL_TITLE = A.getClassName('modal', 'title');

/**
 * Fired when the modal is hidden.
 *
 * @event hide
 */

/**
 * Fired when the modal is saved.
 *
 * @event save
 */

/**
 * A base class for `A.FormBuilderSettingsModal`. It's responsible for the modal that
 * is used by the form builder for editing a field's settings.
 *
 * @class A.FormBuilderSettingsModal
 * @extends A.Base
 * @param {Object} config Object literal specifying widget configuration
 *     properties.
 * @constructor
 */
A.FormBuilderSettingsModal = A.Base.create('form-builder-settings-modal', A.Base, [], {
    TPL_FIELD_SETTINGS_HEAD_CONTENT: '<h4 class="' + CSS_MODAL_TITLE + '"></h4>',

    /**
     * Destructor lifecycle implementation for the `A.FormBuilderSettingsModal` class.
     * Lifecycle.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        if (this._modal) {
            this._modal.destroy();
        }
    },

    /**
     * Hides the settings modal for the given field.
     *
     * @method hide
     */
    hide: function() {
        if (this._modal) {
            this._modal.hide();
        }

        if (this._eventToggleAdvancedContent) {
            this._eventToggleAdvancedContent.detach();
        }
    },

    /**
     * Shows the settings panel for the given field.
     *
     * @method show
     * @param {A.FormField} field
     * @param {String} typeName The name of the field type.
     */
    show: function(field, typeName) {
        var bodyNode,
            firstInput;

        if (!this._modal) {
            this._create();
        }

        bodyNode = this._modal.getStdModNode(A.WidgetStdMod.BODY);
        bodyNode.empty();
        field.renderSettingsPanel(bodyNode);

        this._modal.get('boundingBox').one('.' + CSS_MODAL_TITLE).set('text', typeName);

        this._modal.show();
        this._modal.align();

        firstInput = bodyNode.one('input[type="text"]');
        if (firstInput) {
            firstInput.focus();
        }

        this._eventToggleAdvancedContent = field.on('contentToggle', A.bind(this._updateModalOnContentToggle, this));

        this._fieldBeingEdited = field;
    },

    /**
     * Fired after the `visible` attribute from the modal instance changes.
     *
     * @method _afterModalVisibleChange
     * @param {EventFacade} event
     * @protected
     */
    _afterModalVisibleChange: function(event) {
        if (!event.newVal) {
            this.fire('hide');
        }
    },

    /**
     * Creates and renders the field settings modal for the first time.
     *
     * @method _create
     * @protected
     */
    _create: function() {
        this._modal = new A.Modal({
            centered: true,
            cssClass: CSS_FIELD_SETTINGS,
            draggable: false,
            modal: true,
            headerContent: this.TPL_FIELD_SETTINGS_HEAD_CONTENT,
            resizable: false,
            zIndex: 4
        }).render();

        this._modal.addToolbar(
            [
                {
                    cssClass: [CSS_BTN_PRIMARY, CSS_FIELD_SETTINGS_SAVE].join(' '),
                    label: 'Save',
                    on: {
                        click: A.bind(this._save, this)
                    },
                    render: true
                },
                {
                    cssClass: CSS_FIELD_SETTINGS_CANCEL,
                    label: 'Cancel',
                    on: {
                        click: A.bind(this.hide, this)
                    },
                    render: true
                }
            ],
            A.WidgetStdMod.FOOTER
        );

        this._modal.after('visibleChange', A.bind(this._afterModalVisibleChange, this));
    },

    /**
     * Saves the settings for the field currently being edited.
     *
     * @method _save
     * @protected
     */
    _save: function() {
        if (this._fieldBeingEdited.validateSettings()) {
            this._fieldBeingEdited.saveSettings();

            this.fire('save', {
                field: this._fieldBeingEdited
            });
            this.hide();
        }
    },

    /**
     * Toggle back and close button on small screen and update Modal height.
     *
     * @method _updateModalOnContentToggle
     * @protected
     */
    _updateModalOnContentToggle: function() {
        this._modal.align();
    }
});
