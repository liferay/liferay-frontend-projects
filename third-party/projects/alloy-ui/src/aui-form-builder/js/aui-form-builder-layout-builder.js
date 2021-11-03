/**
 * The Form Builder Layout Builder Component
 *
 * @module aui-form-builder
 * @submodule aui-form-builder-layout-builder
 */

var CSS_CHOOSE_COL_MOVE = A.getClassName('form', 'builder', 'choose', 'col', 'move'),
    CSS_CHOOSE_COL_MOVE_TARGET = A.getClassName('form', 'builder', 'choose', 'col', 'move', 'target'),
    CSS_FIELD = A.getClassName('form', 'builder', 'field'),
    CSS_FIELD_MOVE_BUTTON = A.getClassName('form', 'builder', 'field', 'move', 'button'),
    CSS_FIELD_MOVE_TARGET = A.getClassName('form', 'builder', 'field', 'move', 'target'),
    CSS_FIELD_MOVE_TARGET_INVALID = A.getClassName('form', 'builder', 'field', 'move', 'target', 'invalid'),
    CSS_FIELD_MOVING = A.getClassName('form', 'builder', 'field', 'moving'),
    CSS_LAYOUT = A.getClassName('form', 'builder', 'layout'),
    CSS_LAYOUT_BUILDER_MOVE_CANCEL = A.getClassName('layout', 'builder', 'move', 'cancel'),
    CSS_MOVE_COL_TARGET = A.getClassName('layout', 'builder', 'move', 'col', 'target'),
    CSS_MOVE_ROW_TARGET = A.getClassName('layout', 'builder', 'move', 'row', 'target'),
    CSS_MOVE_TARGET = A.getClassName('layout', 'builder', 'move', 'target'),
    CSS_REMOVE_ROW_MODAL = A.getClassName('form', 'builder', 'remove', 'row', 'modal');

/**
 * `A.FormBuilder` extension, which handles the `A.LayoutBuilder` inside it.
 *
 * @class A.FormBuilderLayoutBuilder
 * @param {Object} config Object literal specifying layout builder configuration
 *     properties.
 * @constructor
 */
A.FormBuilderLayoutBuilder = function() {};

A.FormBuilderLayoutBuilder.prototype = {

    /**
     * Construction logic executed during the `A.FormBuilderLayoutBuilder`
     * instantiation. Lifecycle.
     *
     * @method initializer
     * @protected
     */
    initializer: function() {
        this._initRemoveConfirmationModal();

        this.after({
            render: this._afterLayoutBuilderRender,
            'layout-row:colsChange': this._afterLayoutBuilderColsChange
        });
    },

    /**
     * Destructor implementation for the `A.FormBuilderLayoutBuilder` class.
     * Lifecycle.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        if (this._layoutBuilder) {
            this._layoutBuilder.destroy();
        }

        this._removeConfirmationModal.destroy();
    },

    /**
     * Overrides default `addColMoveButton` attribute.
     *
     * @method _addColMoveButton
     * @param {Node} colNode
     * @param {Node} rowNode
     * @protected
     */
    _addColMoveButton: function(colNode, rowNode) {
        var targetNodes = colNode.all('.' + CSS_FIELD_MOVE_BUTTON);

        targetNodes.setData('node-col', colNode);
        targetNodes.setData('node-row', rowNode);

        this._renderEmptyColumns();
    },

    /**
     * Overrides default `addColMoveTarget` attribute.
     *
     * @method _addColMoveTarget
     * @param {A.LayoutCol} col
     * @protected
     */
    _addColMoveTarget: function(col) {
        var colNode = col.get('node'),
            targetNodes;

        colNode.addClass(CSS_CHOOSE_COL_MOVE_TARGET);

        targetNodes = colNode.all('.' + CSS_FIELD_MOVE_TARGET);
        targetNodes.setData('col', col);
    },

    /**
     * Executed after the `layout:rowsChange` is fired.
     *
     * @method _afterLayoutBuilderColsChange
     * @protected
     */
    _afterLayoutBuilderColsChange: function() {
        var activeLayout = this.getActiveLayout();

        this._checkLastRow(activeLayout);
    },

    /**
     * Executed after the `layout-builder:moveEnd` is fired.
     *
     * @method _afterLayoutBuilderMoveEnd
     * @protected
     */
    _afterLayoutBuilderMoveEnd: function() {
        this._detachCancelMoveRowEvents();
        this._enableAddFields();
        this._fieldToolbar.set('disabled', false);
        this._pageManager.enablePaginations();
    },

    /**
     * Executed after the `layout-builder:moveStart` is fired.
     *
     * @method _afterLayoutBuilderMoveStart
     * @param {EventFacade} event
     * @protected
     */
    _afterLayoutBuilderMoveStart: function(event) {
        if (event.moveElement instanceof A.LayoutRow) {
            this._bindMoveRowEvents();
        }

        this._disableAddFields();
        this._fieldToolbar.set('disabled', true);
        this._pageManager.disablePaginations();
    },

    /**
     * Fired after this widget is rendered.
     *
     * @method _afterLayoutBuilderRender
     * @protected
     */
    _afterLayoutBuilderRender: function() {
        var originalChooseColMoveTargetFn;

        this._layoutBuilder = new A.LayoutBuilder({
            addColMoveButton: A.bind(this._addColMoveButton, this),
            addColMoveTarget: A.bind(this._addColMoveTarget, this),
            clickColMoveTarget: A.bind(this._clickColMoveTarget, this),
            clickRemoveRow: A.bind(this._clickRemoveRow, this),
            container: this.get('contentBox').one('.' + CSS_LAYOUT),
            layout: this.getActiveLayout(),
            removeColMoveButtons: A.bind(this._removeColMoveButtons, this),
            removeColMoveTargets: A.bind(this._removeColMoveTargets, this),
            strings: this.get('strings')
        });

        this._layoutBuilder.after('layout-builder:moveStart', A.bind(this._afterLayoutBuilderMoveStart, this));
        this._layoutBuilder.after('layout-builder:moveEnd', A.bind(this._afterLayoutBuilderMoveEnd, this));
        
        originalChooseColMoveTargetFn = this._layoutBuilder.get('chooseColMoveTarget');
        this._layoutBuilder.set('chooseColMoveTarget', A.bind(this._chooseColMoveTarget, this,
            originalChooseColMoveTargetFn));

        this._eventHandles.push(
            this._fieldToolbar.on('onToolbarHasAddedToField', A.bind(this._onFormBuilderToolbarHasAddedToField, this))
        );

        this._removeLayoutCutColButtons();
    },

    /**
     * Bind events related to the cancel move row funcionality.
     *
     * @method _bindMoveRowEvents
     * @protected
     */
    _bindMoveRowEvents: function() {
        this._cancelMoveRowsHandles = [
            A.one(A.config.doc).on('click', A.bind(this._onClickOutsideMoveRowTarget, this))
        ];
    },

    /**
     * Checks if the last row has more than one col or if it has at least one field,
     * if true a new row is created and set on the last position.
     *
     * @method _checkLastRow
     * @param {A.Layout} layout
     * @protected
     */
    _checkLastRow: function(layout) {
        var cols,
            lastRow,
            nextToLast,
            rows;

        lastRow = this._getLastRow(layout);
        cols = lastRow.get('cols');

        if (cols.length > 1 || !this._isColumnEmpty(cols[0])) {
            this._createLastRow(layout);
        }
        else {
            rows = layout.get('rows');
            nextToLast = rows[rows.length - 2];

            if (nextToLast) {
                cols = nextToLast.get('cols');

                if (cols.length === 1 && this._isColumnEmpty(cols[0])) {
                    layout.removeRow(nextToLast);
                }
            }
        }

        this._getLastRow(layout).set('removable', false);
    },

    /**
     * Overrides default `chooseColMoveTarget` attribute.
     *
     * @method _chooseColMoveTarget
     * @param {Function} originalFn
     * @param {Node} cutButton
     * @param {A.LayoutCol} col
     * @protected
     */
    _chooseColMoveTarget: function(originalFn, cutButton, col) {
        var fieldNode = cutButton.ancestor('.' + CSS_FIELD),
            layout = this.getActiveLayout(),
            targetNode;

        this._fieldBeingMoved = fieldNode.getData('field-instance');
        this._fieldListBeingMoved = col.get('value');
        this._fieldBeingMovedCol = col;

        fieldNode.addClass(CSS_FIELD_MOVING);

        fieldNode.all('.' + CSS_FIELD_MOVE_TARGET).addClass(CSS_FIELD_MOVE_TARGET_INVALID);

        targetNode = fieldNode.previous('.' + CSS_FIELD_MOVE_TARGET);
        if (targetNode) {
            targetNode.addClass(CSS_FIELD_MOVE_TARGET_INVALID);
        }

        targetNode = fieldNode.next('.' + CSS_FIELD_MOVE_TARGET);
        if (targetNode) {
            targetNode.addClass(CSS_FIELD_MOVE_TARGET_INVALID);
        }

        originalFn(cutButton, col);
        this._addColMoveTarget(col);

        layout.normalizeColsHeight(layout.get('node').all('.row'));

        this._selectFirstValidMoveTarget();

        this._cancelMoveFieldHandles = [
            A.one(A.config.doc).on('click', A.bind(this._onClickOutsideMoveColTarget, this)),
            A.one(A.config.doc).on('key', A.bind(this._onEscKeyPressMoveTarget, this), 'down:27')
        ];
    },

    /**
     * Overrides default `clickColMoveTarget` attribute.
     *
     * @method _clickColMoveTarget
     * @param {Node} moveTarget
     * @protected
     */
    _clickColMoveTarget: function(moveTarget) {
        var layout = this.getActiveLayout(),
            parentFieldNode = this._fieldBeingMoved.get('content').ancestor('.' + CSS_FIELD),
            row,
            targetNestedParent = moveTarget.getData('nested-field-parent'),
            toolbarMoveIconCancelMode = this._fieldToolbar.getItem('.' + CSS_LAYOUT_BUILDER_MOVE_CANCEL);

        if (toolbarMoveIconCancelMode) {
            toolbarMoveIconCancelMode.removeClass(CSS_LAYOUT_BUILDER_MOVE_CANCEL);
        }

        if (parentFieldNode) {
            parentFieldNode.getData('field-instance').removeNestedField(this._fieldBeingMoved);
        }
        else {
            row = this.getFieldRow(this._fieldBeingMoved);
            this._fieldListBeingMoved.removeField(this._fieldBeingMoved);
        }

        this._enableAddFields();

        if (targetNestedParent) {
            this._addNestedField(
                targetNestedParent,
                this._fieldBeingMoved,
                moveTarget.getData('nested-field-index')
            );
        }
        else {
            moveTarget.getData('col').get('value').addField(
                this._fieldBeingMoved,
                moveTarget.getData('field-list-index')
            );
        }

        this._removeLayoutCutColButtons();

        layout.normalizeColsHeight(new A.NodeList(this.getFieldRow(this._fieldBeingMoved)));

        this._detachCancelMoveFieldEvents();
    },

    /**
     * Overrides default `clickRemoveRow` attribute. Check if the parameter `row` has fields.
     *
     * @method _clickRemoveRow
     * @param {A.LayoutRow} row
     * @return {Boolean}
     * @protected
     */
    _clickRemoveRow: function(row) {
        var cols = row.get('cols'),
            currentList,
            index;

        for (index = 0; index < cols.length; index++) {
            currentList = cols[index].get('value');

            if (currentList && currentList.get('fields').length) {
                this._removeConfirmationModal.show();
                this._removingRow = row;

                return false;
            }
        }

        return true;
    },

    /**
     * Creates a new row in the last position.
     *
     * @method _createLastRow
     * @param {A.Layout} layout
     * @protected
     */
    _createLastRow: function(layout) {
        var lastRow = new A.LayoutRow(),
            rows = layout.get('rows');

        layout.addRow(rows.length, lastRow);
    },

    /**
     * Detaches events related to the cancel move row funcionality.
     *
     * @method _detachCancelMoveRowEvents
     * @protected
     */
    _detachCancelMoveRowEvents: function() {
        new A.EventHandle(this._cancelMoveRowsHandles).detach();
    },

    /**
     * Detaches events related to the cancel move field funcionality.
     *
     * @method _detachCancelMoveFieldEvents
     * @protected
     */
    _detachCancelMoveFieldEvents: function() {
        new A.EventHandle(this._cancelMoveFieldHandles).detach();
    },

    /**
     * Disable add fields functionality.
     *
     * @method _disableAddFields
     * @protected
     */
    _disableAddFields: function() {
        this.getActiveLayout().get('rows').forEach(function(row) {
            row.get('cols').forEach(function(col) {
                col.get('value').set('enableAddFields', false);
            });
        });
    },

    /**
     * Enable add fields functionality.
     *
     * @method _enableAddFields
     * @protected
     */
    _enableAddFields: function() {
        this.getActiveLayout().get('rows').forEach(function(row) {
            row.get('cols').forEach(function(col) {
                col.get('value').set('enableAddFields', true);
            });
        });
    },

    /**
     * Removes a row even with field.
     *
     * @method _forceRemoveRow
     * @protected
     */
    _forceRemoveRow: function() {
        this.getActiveLayout().removeRow(this._removingRow);

        this._removeConfirmationModal.hide();
    },

    /**
     * Gets the last row.
     *
     * @method _getLastRow
     * @param {A.Layout} layout
     * @protected
     * @return {A.LayoutRow}
     */
    _getLastRow: function(layout) {
        var rows = layout.get('rows');

        return rows[rows.length - 1];
    },

    /**
     * Create a confirmation modal to be used when a remove row button from a row with
     * fields is clicked.
     *
     * @method _initRemoveConfirmationModal
     * @protected
     */
    _initRemoveConfirmationModal: function() {
        var modal = new A.Modal({
            bodyContent: this.get('strings').removeRowModal,
            centered: true,
            cssClass: CSS_REMOVE_ROW_MODAL,
            headerContent: this.get('strings').modalHeader,
            modal: true,
            resizable: false,
            visible: false,
            zIndex: 4
        }).render();

        modal.addToolbar([
            {
                cssClass: 'btn-primary',
                label: this.get('strings').confirmRemoveRow,
                on: {
                    click: A.bind(this._forceRemoveRow, this)
                },
                render: true
            },
            {
                label: this.get('strings').cancelRemoveRow,
                on: {
                    click: function() {
                        modal.hide();
                    }
                },
                render: true
            }
        ]);

        this._removeConfirmationModal = modal;
    },

    /**
     * Checks if the given column is empty.
     *
     * @method _isColumnEmpty
     * @param {A.LayoutCol} col
     * @return {Boolean}
     * @protected
     */
    _isColumnEmpty: function(col) {
        return !col.get('value') || !col.get('value').get('fields').length;
    },

    /**
     * Fires when click event is triggered.
     *
     * @method _onClickOutsideMoveColTarget
     * @param {EventFacade} event
     * @protected
     */
    _onClickOutsideMoveColTarget: function(event) {
        var targetNode = event.target,
        toolbarMoveIconCancelMode = this._fieldToolbar.getItem('.' + CSS_LAYOUT_BUILDER_MOVE_CANCEL);

        if (toolbarMoveIconCancelMode) {
            toolbarMoveIconCancelMode.removeClass(CSS_LAYOUT_BUILDER_MOVE_CANCEL);
        }

        if (!(targetNode.hasClass(CSS_MOVE_TARGET) && targetNode.hasClass(CSS_MOVE_COL_TARGET))) {
            this._layoutBuilder.cancelMove();
            this._detachCancelMoveFieldEvents();
        }
    },

    /**
     * Fires when click event is triggered.
     *
     * @method _onClickOutsideMoveRowTarget
     * @param {EventFacade} event
     * @protected
     */
    _onClickOutsideMoveRowTarget: function(event) {
        var targetNode = event.target;

        if (!(targetNode.hasClass(CSS_MOVE_ROW_TARGET))) {
            this._layoutBuilder.cancelMove();
        }
    },

    /**
     * Fires when esc key press event is triggered.
     *
     * @method _onEscKeyPressMoveTarget
     * @protected
     */
    _onEscKeyPressMoveTarget: function() {
        var toolbarMoveIconCancelMode = this._fieldToolbar.getItem('.' + CSS_LAYOUT_BUILDER_MOVE_CANCEL);

        if (toolbarMoveIconCancelMode) {
            toolbarMoveIconCancelMode.removeClass(CSS_LAYOUT_BUILDER_MOVE_CANCEL);
        }

        this._layoutBuilder.cancelMove();
        this._detachCancelMoveFieldEvents();
    },

    /**
     * Fired when mouse enters a toolbar's field.
     *
     * @method _onFormBuilderToolbarHasAddedToField
     * @params {EventFacade} event
     * @protected
     */
    _onFormBuilderToolbarHasAddedToField: function(event) {
        this._setMoveButtonData(event.colNode);
    },

    /**
     * Overrides default `removeColMoveButtons` attribute.
     *
     * @method _removeColMoveButtons
     * @protected
     */
    _removeColMoveButtons: function() {
        this.get('contentBox').all('.' + CSS_CHOOSE_COL_MOVE).removeClass(CSS_CHOOSE_COL_MOVE);
    },

    /**
     * Overrides default `removeColMoveTargets` attribute.
     *
     * @method _removeColMoveTargets
     * @protected
     */
    _removeColMoveTargets: function() {
        var contentBox = this.get('contentBox'),
            layout = this.getActiveLayout();

        contentBox.all('.' + CSS_CHOOSE_COL_MOVE_TARGET).removeClass(CSS_CHOOSE_COL_MOVE_TARGET);
        contentBox.all('.' + CSS_FIELD_MOVING).removeClass(CSS_FIELD_MOVING);
        contentBox.all('.' + CSS_FIELD_MOVE_TARGET_INVALID).removeClass(CSS_FIELD_MOVE_TARGET_INVALID);

        layout.normalizeColsHeight(layout.get('node').all('.row'));
    },

    /**
     * Remove original layout cut col buttons.
     *
     * @method _removeLayoutCutColButtons
     * @protected
     */
    _removeLayoutCutColButtons: function() {
        this._layoutBuilder.get('removeColMoveButtons')();
    },

    /**
     * Find and focus on first valid move target.
     *
     * @method _selectFirstValidMoveTarget
     * @protected
     */
    _selectFirstValidMoveTarget: function() {
        var moveTarget = A.one('.' + CSS_FIELD_MOVE_TARGET + ':not(.' + CSS_FIELD_MOVE_TARGET_INVALID + ')');

        moveTarget.focus();
    },

    /**
     * Show or hide move item in toolbar.
     *
     * @method _setMoveButtonData
     * @param {Node} colNode
     * @protected
     */
    _setMoveButtonData: function(colNode) {
        var moveItem = this._fieldToolbar.getItem('.layout-builder-move-cut-button');

        moveItem.setData('layout-row', colNode.ancestor('.row').getData('layout-row'));
        moveItem.setData('node-col', colNode);
    }
};
