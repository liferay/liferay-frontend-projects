'use strict';

import core from 'metal';
import dom from 'metal-dom';
import Scrollspy from 'metal-scrollspy';

/**
 * A Scrollspy implementation that also tracks the percentage of the text that
 * has already been covered by the scrolling, instead of just marking the one
 * being currently viewed.
 */
class ReadingProgressTracker extends Scrollspy {
	/**
	 * Initializes the main behavior. This is being overriden instead of the
	 * constructor because the events need to be attached before the `Scrollspy`
	 * super class init code runs. Unfortunately, it's not possible to reference
	 * `this` before calling `super` on ES2015 constructors (compilers like babel
	 * throw errors).
	 * @override
	 */
	init() {
		this.on('activeIndexChanged', this.handleActiveIndexChanged);
		this.on('progressChanged', this.handleProgressChanged);

		super.init();
	}

	/**
	 * Overrides the original method from `Scrollspy` to also calculate the
	 * reading progress of the currently active link.
	 */
	checkPosition() {
		super.checkPosition();
		this.updateProgress();
	}

	/**
	 * Handles the `activeIndexChanged` event. Removes reading progress information
	 * from the previously active link and updates the markup of links according
	 * to their completion state.
	 * @param {!Object} data
	 */
	handleActiveIndexChanged(data) {
		if (core.isDef(data.prevVal) && data.prevVal >= 0) {
			var prevElement = this.getElementForIndex(data.prevVal);
			prevElement.removeAttribute('data-reading-progress');
		}
		this.updateCompleted();
	}

	/**
	 * Handles the `progressChanged` event. Updates the `data-reading-progress`
	 * attribute of the currently active link.
	 * @param {!Object} data
	 */
	handleProgressChanged(data) {
		var element = this.getElementForIndex(this.activeIndex);
		element.setAttribute('data-reading-progress', data.newVal);
		if (data.newVal < 100) {
			dom.removeClasses(element, this.completedClass);
		} else {
			dom.addClasses(element, this.completedClass);
		}
	}

	/**
	 * Updates the links with the class specified by the `completedClass`
	 * attribute, adding it to the links that have been scrolled through and
	 * removing from the links that haven't.
	 */
	updateCompleted() {
		for (var i = 0; i < this.regions.length; i++) {
			var element = this.resolveElement(this.regions[i].link);
			if (i < this.activeIndex) {
				dom.addClasses(element, this.completedClass);
			} else {
				dom.removeClasses(element, this.completedClass);
			}
		}
	}

	/**
	 * Updates the current reading progress value.
	 */
	updateProgress() {
		var index = this.activeIndex;
		if (index >= 0) {
			var region = this.regions[index];
			var position = this.getCurrentPosition();
			var maxBottom = this.getScrollHeight_() + this.offset;
			var bottom = Math.min(maxBottom, region.bottom);
			this.progress = Math.min(
				(100 * (position - region.top)) / (bottom - region.top),
				100
			);
		}
	}
}

/**
 * ReadingProgressTracker' state config.
 * @type {!Object}
 */
ReadingProgressTracker.STATE = {
	/**
	 * The CSS class that will be added to links that reach 100% percentage.
	 * @type {string}
	 */
	completedClass: {
		validator: core.isString,
		value: 'reading-progress-completed'
	},

	/**
	 * The reading progress for the currently active link, in percentage.
	 * @type {number}
	 */
	progress: {
		validator: core.isNumber,
		value: 0
	}
};

export default ReadingProgressTracker;
