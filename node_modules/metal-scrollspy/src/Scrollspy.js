'use strict';

import core from 'metal';
import dom from 'metal-dom';
import Position from 'metal-position';
import State from 'metal-state';

/**
 * Scrollspy utility.
 */
class Scrollspy extends State {
	/**
	 * @inheritDoc
	 */
	constructor(opt_config) {
		super(opt_config);

		/**
		 * Holds the regions cache.
		 * @type {!Array}
		 * @private
		 * @default []
		 */
		this.regions = [];

		/**
		 * Holds event handle that listens scroll shared event emitter proxy.
		 * @type {!EventHandle}
		 * @protected
		 */
		this.scrollHandle_ = dom.on(this.scrollElement, 'scroll', this.checkPosition.bind(this));

		this.init();
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.deactivateAll();
		this.scrollHandle_.dispose();
		super.disposeInternal();
	}

	/**
	 * Activates index matching element.
	 * @param {number} index
	 */
	activate(index) {
		if (this.activeIndex >= 0) {
			this.deactivate(this.activeIndex);
		}
		this.activeIndex = index;
		dom.addClasses(this.getElementForIndex(index), this.activeClass);
	}

	/**
	 * Checks position of elements and activate the one in region.
	 */
	checkPosition() {
		var scrollHeight = this.getScrollHeight_();
		var scrollTop = Position.getScrollTop(this.scrollElement);

		if (scrollHeight < scrollTop + this.offset) {
			this.activate(this.regions.length - 1);
			return;
		}

		var index = this.findBestRegionAt_();
		if (index !== this.activeIndex) {
			if (index === -1) {
				this.deactivateAll();
			} else {
				this.activate(index);
			}
		}
	}

	/**
	 * Deactivates index matching element.
	 * @param {number} index
	 */
	deactivate(index) {
		dom.removeClasses(this.getElementForIndex(index), this.activeClass);
	}

	/**
	 * Deactivates all elements.
	 */
	deactivateAll() {
		for (var i = 0; i < this.regions.length; i++) {
			this.deactivate(i);
		}
		this.activeIndex = -1;
	}

	/**
	 * Finds best region to activate.
	 * @return {number} The index of best region found.
	 */
	findBestRegionAt_() {
		var index = -1;
		var origin = this.getCurrentPosition();
		if (this.regions.length > 0 && origin >= this.regions[0].top) {
			for (var i = 0; i < this.regions.length; i++) {
				var region = this.regions[i];
				var lastRegion = i === this.regions.length - 1;
				if ((origin >= region.top) && (lastRegion || (origin < this.regions[i + 1].top))) {
					index = i;
					break;
				}
			}
		}
		return index;
	}

	/**
	 * Gets the current position in the page.
	 * @return {number}
	 */
	getCurrentPosition() {
		var scrollTop = Position.getScrollTop(this.scrollElement);
		return scrollTop + this.offset + this.scrollElementRegion_.top;
	}

	/**
	 * Returns the element that should be used for the link at the given index.
	 * @param {number} index
	 * @return {!Element}
	 */
	getElementForIndex(index) {
		return this.resolveElement(this.regions[index].link);
	}

	/**
	 * Gets the scroll height of `scrollElement`.
	 * @return {number}
	 * @protected
	 */
	getScrollHeight_() {
		var scrollHeight = Position.getHeight(this.scrollElement);
		scrollHeight += this.scrollElementRegion_.top;
		scrollHeight -= Position.getClientHeight(this.scrollElement);
		return scrollHeight;
	}

	/**
	 * Initializes the behavior of scrollspy. It's important to have this as a
	 * separate function so subclasses can override it (babel doesn't allow using
	 * `this` on constructors before calling `super()`).
	 */
	init() {
		this.refresh();
		this.on('elementChanged', this.refresh);
		this.on('offsetChanged', this.checkPosition);
		this.on('scrollElementChanged', this.onScrollElementChanged_);
		this.on('selectorChanged', this.refresh);
	}

	/**
	 * Fired when the value of the `scrollElement` state changes.
	 * Refreshes the spy and updates the event handler to listen to the new scroll element.
	 * @param {!Event} event
	 * @protected
	 */
	onScrollElementChanged_(event) {
		this.refresh();

		this.scrollHandle_.dispose();
		this.scrollHandle_ = dom.on(event.newVal, 'scroll', this.checkPosition.bind(this));
	}

	/**
	 * Refreshes all regions from document. Relevant when spying elements that
	 * nodes can be added and removed.
	 */
	refresh() {
		// Removes the "active" class from all current regions.
		this.deactivateAll();

		this.scrollElementRegion_ = Position.getRegion(this.scrollElement);
		this.scrollHeight_ = this.getScrollHeight_();

		this.regions = [];
		var links = this.element.querySelectorAll(this.selector);
		var scrollTop = Position.getScrollTop(this.scrollElement);
		for (var i = 0; i < links.length; ++i) {
			var link = links[i];
			if (link.hash && (link.hash.length > 1)) {
				var element = document.getElementById(link.hash.substring(1));
				if (element) {
					var region = Position.getRegion(element);
					this.regions.push({
						link: link,
						top: region.top + scrollTop,
						bottom: region.bottom + scrollTop
					});
				}
			}
		}
		this.sortRegions_();

		// Removes the "active" class from all new regions and then activate the right one for
		// the current position.
		this.deactivateAll();
		this.checkPosition();
	}

	/**
	 * Sorts regions from lower to higher on y-axis.
	 * @protected
	 */
	sortRegions_() {
		this.regions.sort(function(a, b) {
			return a.top - b.top;
		});
	}
}

Scrollspy.STATE = {
	/**
	 * Class to be used as active class.
	 * @type {string}
	 */
	activeClass: {
		validator: core.isString,
		value: 'active'
	},

	/**
	 * The index of the currently active link.
	 * @type {number}
	 */
	activeIndex: {
		validator: core.isNumber,
		value: -1
	},

	/**
	 * Function that receives the matching element as argument and return
	 * itself. Relevant when the `activeClass` must be applied to a different
	 * element, e.g. a parentNode.
	 * @type {function}
	 * @default core.identityFunction
	 */
	resolveElement: {
		validator: core.isFunction,
		value: core.identityFunction
	},

	/**
	 * The scrollElement element to be used as scrollElement area for scrollspy.
	 * The scrollElement is where the scroll event is listened from.
	 * @type {Element|Window}
	 */
	scrollElement: {
		setter: dom.toElement,
		value: document
	},

	/**
	 * Defines the offset that triggers scrollspy.
	 * @type {number}
	 * @default 0
	 */
	offset: {
		validator: core.isNumber,
		value: 0
	},

	/**
	 * Element to be used as alignment reference of scrollspy.
	 * @type {Element}
	 */
	element: {
		setter: dom.toElement
	},

	/**
	 * Selector to query elements inside `element` to be activated.
	 * @type {Element}
	 * @default 'a'
	 */
	selector: {
		validator: core.isString,
		value: 'a'
	}
};

export default Scrollspy;
