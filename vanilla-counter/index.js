(function () {
	'use strict';

	// Note this needs to be a real ES6 class (not transpiled).
	//
	// See: https://github.com/w3c/webcomponents/issues/587
	class VanillaCounter extends HTMLElement {
		constructor() {
			super();

			this.value = 0;

			this.counter = document.createElement('span');
			this.counter.innerText = this.value;

			this.decrementButton = document.createElement('button');
			this.decrementButton.innerText = '-';

			this.incrementButton = document.createElement('button');
			this.incrementButton.innerText = '+';

			const style = document.createElement('style');

			style.innerHTML = `
				button {
					height: 24px;
					width: 24px;
				}

				span {
					display: inline-block;
					font-style: italic;
					margin: 0 1em;
				}
			`;

			const root = document.createElement('div');

			root.appendChild(style);
			root.appendChild(this.decrementButton);
			root.appendChild(this.incrementButton);
			root.appendChild(this.counter);

			this.attachShadow({mode: 'open'}).appendChild(root);

			this.decrement = this.decrement.bind(this);
			this.increment = this.increment.bind(this);
		}

		connectedCallback() {
			this.decrementButton.addEventListener('click', this.decrement);
			this.incrementButton.addEventListener('click', this.increment);
		}

		decrement() {
			this.counter.innerText = --this.value;
		}

		disconnectedCallback() {
			this.decrementButton.removeEventListener('click', this.decrement);
			this.incrementButton.removeEventListener('click', this.increment);
		}

		increment() {
			this.counter.innerText = ++this.value;
		}
	}

	if (customElements.get('vanilla-counter')) {
		console.log(
			'Skipping registration for <vanilla-counter> (already registered)'
		);
	} else {
		customElements.define('vanilla-counter', VanillaCounter);
	}
})();
