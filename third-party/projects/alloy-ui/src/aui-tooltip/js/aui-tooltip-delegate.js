/**
 * The Toggler Component
 *
 * @module aui-tooltip
 */

var Lang = A.Lang,
    DOC = A.config.doc;

/**
 * A base class for Toggler Delegate.
 *
 * Check the [live demo](http://alloyui.com/examples/tooltip/).
 *
 * @class A.TooltipDelegate
 * @extends Base
 * @param {Object} config Object literal specifying widget configuration
 *     properties.
 * @constructor
 */
A.TooltipDelegate = A.Base.create('tooltip-delegate', A.Base, [], {
    items: null,

    tooltip: null,

    /**
     * Construction logic executed during TooltipDelegate instantiation.
     * Lifecycle.
     *
     * @method initializer
     * @protected
     */
    initializer: function() {
        var instance = this,
            useARIA = instance.get('useARIA');

        instance._eventHandles = [];

        instance.bindUI();

        if (useARIA) {
            instance.plug(A.Plugin.Aria);
        }
    },

    /**
     * Destructor lifecycle implementation for the `TooltipDelegate` class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        var instance = this;

        (new A.EventHandle(instance._eventHandles)).detach();
    },

    /**
     * Bind the events on the TooltipDelegate UI. Lifecycle.
     *
     * @method bindUI
     * @protected
     */
    bindUI: function() {
        var instance = this,
            container,
            trigger;
        container = instance.get('container');
        trigger = instance.get('trigger');

        instance._eventHandles.push(
            container.delegate(
                instance.get('triggerShowEvent'),
                A.bind(instance._onUserShowInteraction, instance), trigger),
            container.delegate(
                instance.get('triggerHideEvent'),
                A.bind(instance._onUserHideInteraction, instance), trigger)
        );
    },

    /**
     * Get the current Tooltip.
     *
     * @method getTooltip
     * @return {Tooltip}
     */
    getTooltip: function() {
        var instance = this,
            tooltip = instance.tooltip;

        if (!tooltip) {
            tooltip = instance.tooltip = new A.Tooltip({
                align: instance.get('align'),
                bindDOMEvents: false,
                cssClass: instance.get('cssClass'),
                duration: instance.get('duration'),
                formatter: instance.get('formatter'),
                opacity: instance.get('opacity'),
                position: instance.get('position'),
                html: instance.get('html'),
                useARIA: instance.get('useARIA'),
                visible: false,
                zIndex: instance.get('zIndex')
            });
        }

        return tooltip;
    },

    /**
     * Show tooltip on user interaction.
     *
     * @method _onUserHideInteraction
     * @param event
     * @protected
     */
    _onUserHideInteraction: function() {
        var instance = this,
            tooltipBoundingBox = instance.getTooltip().get('boundingBox'),
            useARIA = instance.get('useARIA');

        instance.getTooltip().hide();

        if (useARIA) {
            instance.aria.setAttribute('hidden', true, tooltipBoundingBox);
        }
    },

    /**
     * Show tooltip on user interaction.
     *
     * @method _onUserShowInteraction
     * @param event
     * @protected
     */
    _onUserShowInteraction: function(event) {
        var instance = this,
            tooltipBoundingBox = instance.getTooltip().get('boundingBox'),
            trigger = event.currentTarget,
            useARIA = instance.get('useARIA');

        instance.getTooltip().show().set('trigger', trigger).render();

        if (useARIA) {
            instance.aria.setAttribute('hidden', false, tooltipBoundingBox);
        }
    },

    /**
     * Validate the trigger events.
     *
     * @method _validateTriggerEvent
     * @param  {String | Array} val
     * @protected
     */
    _validateTriggerEvent: function(val) {
        if (A.Lang.isString(val)) {
            return true;
        }
        else if (A.Lang.isArray(val)) {
            return val.every(function (element) {
                return A.Lang.isString(element);
            });
        }

        return false;
    }
}, {
    /**
     * Static property used to define the default attribute
     * configuration for the Toggler Delegate.
     *
     * @property ATTRS
     * @type Object
     * @static
     */
    ATTRS: {
        /**
         * The alignment configuration for this widget.
         *
         * @attribute align
         * @default Guess position.
         * @type Object
         */
        align: {
            value: null
        },

        /**
         * The container of Toggler Delegate instance.
         *
         * @attribute container
         */
        container: {
            setter: A.one,
            value: DOC,
            writeOnce: true
        },

        /**
         * The CSS class applied to the tooltip.
         *
         * @attribute cssClass
         */
        cssClass: {
            value: null
        },

        /**
         * Determine the duration of the tooltip animation.
         *
         * @attribute duration
         * @default 0.15
         * @type {Number}
         */
        duration: {
            value: 0.15,
            writeOnce: true
        },

        formatter: A.Tooltip.ATTRS.formatter,

        /**
         * Determines if the tooltip allows arbitary HTML or is plain text.
         *
         * @attribute html
         * @default false
         * @type Boolean
         */
        html: {
            value: false,
            validator: Lang.isBoolean
        },

        /**
         * Determine the opacity of the tooltip.
         *
         * @attribute opacity
         * @default 0.8
         * @type {Number}
         */
        opacity: {
            value: 0.8,
            writeOnce: true
        },

        position: A.WidgetPositionAlignSuggestion.ATTRS.position,

        trigger: A.WidgetPositionAlignSuggestion.ATTRS.trigger,

        /**
         * DOM event to hide the tooltip.
         *
         * @attribute triggerHideEvent
         * @default MOUSEENTER
         * @type String
         */
        triggerHideEvent: {
            validator: '_validateTriggerEvent',
            value: 'mouseleave',
            writeOnce: true
        },

        /**
         * DOM event to show the tooltip.
         *
         * @attribute triggerShowEvent
         * @default MOUSEENTER
         * @type String
         */
        triggerShowEvent: {
            validator: '_validateTriggerEvent',
            value: 'mouseenter',
            writeOnce: true
        },

        /**
        * Boolean indicating if use of the WAI-ARIA Roles and States
        * should be enabled.
        *
        * @attribute useARIA
        * @default true
        * @type Boolean
        */
        useARIA: {
            validator: Lang.isBoolean,
            value: true,
            writeOnce: 'initOnly'
        },

        /**
         * Specify the zIndex for the tooltips.
         *
         * @attribute zIndex
         * @type {Number}
         */
        zIndex: {}
    }
});
