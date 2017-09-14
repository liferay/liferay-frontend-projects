'use strict';

import core from 'metal';
import dom from 'metal-dom';
import { EventHandler } from 'metal-events';
import State from 'metal-state';

/**
 * Toggler component.
 */
class Toggler extends State {
	/**
	 * @inheritDoc
	 */
	constructor(opt_config) {
		super(opt_config);

		this.headerEventHandler_ = new EventHandler();

		this.on('headerChanged', this.syncHeader);
		this.syncHeader();
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();
		this.headerEventHandler_.removeAllListeners();
	}

	/**
	* Manually collapse the content's visibility.
	* @param {string|!Element} header
	*/
	collapse(header) {
		let headerElements = this.getHeaderElements_(header);
		let content = this.getContentElement_(headerElements);
		dom.removeClasses(content, this.expandedClasses);
		dom.addClasses(content, this.collapsedClasses);
		dom.removeClasses(headerElements, this.headerExpandedClasses);
		dom.addClasses(headerElements, this.headerCollapsedClasses);
	}

	/**
	* Manually expand the content's visibility.
	* @param {string|!Element} header
	*/
	expand(header) {
		let headerElements = this.getHeaderElements_(header);
		let content = this.getContentElement_(headerElements);
		dom.addClasses(content, this.expandedClasses);
		dom.removeClasses(content, this.collapsedClasses);
		dom.addClasses(headerElements, this.headerExpandedClasses);
		dom.removeClasses(headerElements, this.headerCollapsedClasses);
	}

	/**
	 * Gets the content to be toggled by the given header element.
	 * @param {!Element} header
	 * @returns {!Element}
	 * @protected
	 */
	getContentElement_(header) {
		if (core.isElement(this.content)) {
			return this.content;
		}

		var content = dom.next(header, this.content);
		if (content) {
			return content;
		}

		if (core.isElement(header)) {
			content = header.querySelector(this.content);
			if (content) {
				return content;
			}
		}

		return this.container.querySelectorAll(this.content);
	}

	/**
	 * Gets the header elements by giving a selector.
	 * @param {string} header
	 * @returns {!Nodelist}
	 * @protected
	 */
	getHeaderElements_(header = this.header) {
		if (core.isElement(header) || core.isElement(header[0])) {
			return header;
		}
		return this.container.querySelectorAll(header);
	}

	/**
	 * Handles a `click` event on the header.
	 * @param {!Event} event
	 * @protected
	 */
	handleClick_(event) {
		this.toggle(event.delegateTarget || event.currentTarget);
	}

	/**
	 * Handles a `keydown` event on the header.
	 * @param {!Event} event
	 * @protected
	 */
	handleKeydown_(event) {
		if (event.keyCode === 13 || event.keyCode === 32) {
			this.toggle(event.delegateTarget || event.currentTarget);
			event.preventDefault();
		}
	}

	/**
	 * Checks if there is any expanded header in the component context.
	 * @param {string|!Element} event
	 * @param {boolean}
	 * @protected
	 */
	hasExpanded_(header) {
		if (core.isElement(header)) {
			return dom.hasClass(header, this.headerExpandedClasses);
		}
		return !!this.container.querySelectorAll(`.${this.headerExpandedClasses}`).length;
	}

	/**
	 * Syncs the component according to the value of the `header` state,
	 * attaching events to the new element and detaching from any previous one.
	 */
	syncHeader() {
		this.headerEventHandler_.removeAllListeners();
		if (this.header) {
			if (core.isString(this.header)) {
				this.headerEventHandler_.add(
					dom.delegate(this.container, 'click', this.header, this.handleClick_.bind(this)),
					dom.delegate(this.container, 'keydown', this.header, this.handleKeydown_.bind(this))
				);
			} else {
				this.headerEventHandler_.add(
					dom.on(this.header, 'click', this.handleClick_.bind(this)),
					dom.on(this.header, 'keydown', this.handleKeydown_.bind(this))
				);
			}
		}
	}

	/**
	 * Toggles the content's visibility.
	 * @param {string|!Element} header
	 */
	toggle(header) {
		let headerElements = this.getHeaderElements_(header);
		if (this.hasExpanded_(headerElements)) {
			this.collapse(headerElements);
		} else {
			this.expand(headerElements);
		}
	}
}

/**
 * State configuration.
 */
Toggler.STATE = {
	/**
	 * The CSS classes added to the content when it's collapsed.
	 */
	collapsedClasses: {
		validator: core.isString,
		value: 'toggler-collapsed'
	},

	/**
	 * The element where the header/content selectors will be looked for.
	 * @type {string|!Element}
	 */
	container: {
		setter: dom.toElement,
		validator: value => core.isString(value) || core.isElement(value),
		value: document
	},

	/**
	 * The element that should be expanded/collapsed by this toggler.
	 * @type {string|!Element}
	 */
	content: {
		validator: value => core.isString(value) || core.isElement(value)
	},

	/**
	 * The CSS classes added to the content when it's expanded.
	 */
	expandedClasses: {
		validator: core.isString,
		value: 'toggler-expanded'
	},

	/**
	 * The element that should be trigger toggling.
	 * @type {string|!Element}
	 */
	header: {
		validator: value => core.isString(value) || core.isElement(value)
	},

	/**
	 * The CSS classes added to the header when the content is collapsed.
	 */
	headerCollapsedClasses: {
		validator: core.isString,
		value: 'toggler-header-collapsed'
	},

	/**
	 * The CSS classes added to the header when the content is expanded.
	 */
	headerExpandedClasses: {
		validator: core.isString,
		value: 'toggler-header-expanded'
	}
};

export default Toggler;
