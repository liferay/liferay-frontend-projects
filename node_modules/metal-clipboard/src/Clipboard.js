'use strict';

import core from 'metal';
import dom from 'metal-dom';
import State from 'metal-state';

/**
 * Clipboard component.
 */
class Clipboard extends State {
	/**
	 * Delegates a click event to the passed selector.
	 */
	constructor(opt_config) {
		super(opt_config);

		this.listener_ = dom.on(this.selector, 'click', (e) => this.initialize(e));
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.listener_.dispose();
		this.listener_ = null;
		if (this.clipboardAction_) {
			this.clipboardAction_.dispose();
			this.clipboardAction_ = null;
		}
	}

	/**
	 * Defines a new `ClipboardAction` on each click event.
	 * @param {!Event} e
	 */
	initialize(e) {
		if (this.clipboardAction_) {
			this.clipboardAction_ = null;
		}

		this.clipboardAction_ = new ClipboardAction({
			host: this,
			action: this.action(e.delegateTarget),
			target: this.target(e.delegateTarget),
			text: this.text(e.delegateTarget),
			trigger: e.delegateTarget
		});
	}
}

/**
 * State definition.
 * @type {!Object}
 * @static
 */
Clipboard.STATE = {
	/**
	 * A function that returns the name of the clipboard action that should be done
	 * when for the given element (either 'copy' or 'cut').
	 * @type {!function(!Element)}
	 */
	action: {
		validator: core.isFunction,
		value: function(delegateTarget) {
			return delegateTarget.getAttribute('data-action');
		}
	},

	/**
	 * The selector for all elements that should be listened for clipboard actions.
	 * @type {string}
	 */
	selector: {
		value: '[data-clipboard]',
		validator: core.isString
	},

	/**
	 * A function that returns an element that has the content to be copied to the
	 * clipboard.
	 * @type {!function(!Element)}
	 */
	target: {
		validator: core.isFunction,
		value: function(delegateTarget) {
			return document.querySelector(delegateTarget.getAttribute('data-target'));
		}
	},

	/**
	 * A function that returns the text to be copied to the clipboard.
	 * @type {!function(!Element)}
	 */
	text: {
		validator: core.isFunction,
		value: function(delegateTarget) {
			return delegateTarget.getAttribute('data-text');
		}
	}
};

/**
 * ClipboardAction component.
 */
class ClipboardAction extends State {
	/**
	 * Initializes selection either from a `text` or `target` state.
	 */
	constructor(opt_config) {
		super(opt_config);

		if (this.text) {
			this.selectValue();
		} else if (this.target) {
			this.selectTarget();
		}
	}

	/**
	 * Removes current selection and focus from `target` element.
	 */
	clearSelection() {
		if (this.target) {
			this.target.blur();
		}

		window.getSelection().removeAllRanges();
	}

	/**
	 * Executes the copy operation based on the current selection.
	 */
	copyText() {
		let succeeded;

		try {
			succeeded = document.execCommand(this.action);
		} catch (err) {
			succeeded = false;
		}

		this.handleResult(succeeded);
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.removeFakeElement();
		super.disposeInternal();
	}

	/**
	 * Emits an event based on the copy operation result.
	 * @param {boolean} succeeded
	 */
	handleResult(succeeded) {
		if (succeeded) {
			this.host.emit('success', {
				action: this.action,
				text: this.selectedText,
				trigger: this.trigger,
				clearSelection: this.clearSelection.bind(this)
			});
		} else {
			this.host.emit('error', {
				action: this.action,
				trigger: this.trigger,
				clearSelection: this.clearSelection.bind(this)
			});
		}
	}

	/**
	 * Removes the fake element that was added to the document, as well as its
	 * listener.
	 */
	removeFakeElement() {
		if (this.fake) {
			dom.exitDocument(this.fake);
		}

		if (this.removeFakeHandler) {
			this.removeFakeHandler.removeListener();
		}
	}

	/**
	 * Selects the content from element passed on `target` state.
	 */
	selectTarget() {
		if (this.target.nodeName === 'INPUT' || this.target.nodeName === 'TEXTAREA') {
			this.target.select();
			this.selectedText = this.target.value;
		} else {
			let range = document.createRange();
			let selection = window.getSelection();

			range.selectNodeContents(this.target);
			selection.addRange(range);
			this.selectedText = selection.toString();
		}

		this.copyText();
	}

	/**
	 * Selects the content from value passed on `text` state.
	 */
	selectValue() {
		this.removeFakeElement();
		this.removeFakeHandler = dom.once(document, 'click', this.removeFakeElement.bind(this));

		this.fake = document.createElement('textarea');
		this.fake.style.position = 'fixed';
		this.fake.style.left = '-9999px';
		this.fake.setAttribute('readonly', '');
		this.fake.value = this.text;
		this.selectedText = this.text;

		dom.enterDocument(this.fake);

		this.fake.select();
		this.copyText();
	}
}

/**
 * State definition.
 * @type {!Object}
 * @static
 */
ClipboardAction.STATE = {
	/**
	 * The action to be performed (either 'copy' or 'cut').
	 * @type {string}
	 * @default 'copy'
	 */
	action: {
		value: 'copy',
		validator: function(val) {
			return val === 'copy' || val === 'cut';
		}
	},

	/**
	 * A reference to the `Clipboard` base class.
	 * @type {!Clipboard}
	 */
	host: {
		validator: function(val) {
			return val instanceof Clipboard;
		}
	},

	/**
	 * The text that is current selected.
	 * @type {string}
	 */
	selectedText: {
		validator: core.isString
	},

	/**
	 * The ID of an element that will be have its content copied.
	 * @type {Element}
	 */
	target: {
		validator: core.isElement
	},

	/**
	 * The text to be copied.
	 * @type {string}
	 */
	text: {
		validator: core.isString
	},

	/**
	 * The element that when clicked initiates a clipboard action.
	 * @type {!Element}
	 */
	trigger: {
		validator: core.isElement
	}
};

export default Clipboard;
