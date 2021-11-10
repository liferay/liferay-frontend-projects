(function () {
	'use strict';

	/**
	 * Similar to the implementation of `lookupCallback` in simple-react-app.
	 *
	 * Given a descriptor of the form `foo.bar.baz`, looks up
	 * `window.foo.bar.baz`.
	 *
	 * Returns `undefined` if no such property exists.
	 */
	function lookupDescriptor(descriptor) {
		let value;

		if (/^(?:\w+)(?:\.\w+)*$/.test(descriptor)) {
			value = descriptor.split('.').reduce((acc, property) => {
				if (acc && property in acc) {
					return acc[property];
				}
			}, window);
		} else {
			console.warning(
				`Malformed descriptor: ${JSON.stringify(descriptor)}`
			);
		}

		return value;
	}

	// Demo reducer.

	let defaultText = 'Lorem ipsum';

	const WORDS = `
		lorem ipsum dolor sit amet consectetur adipiscing elit sed do
		eiusmod tempor incididunt ut labore et dolore magna aliqua Ut
		enim ad minim veniam quis nostrud exercitation ullamco laboris
		nisi ut aliquip ex ea commodo consequat duis aute irure dolor in
		reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
		pariatur excepteur sint occaecat cupidatat non proident sunt in
		culpa qui officia deserunt mollit anim id est laborum
	`
		.trim()
		.split(/\s+/);

	function getRandomWord() {
		return WORDS[Math.floor(Math.random() * WORDS.length)];
	}

	function reducer(state, action) {
		// Normally you wouldn't have to write your reducer so defensively (ie.
		// to tolerate `undefined` state) but in the case of using the "default"
		// store in DXP, it's already initialized to an empty object before you
		// get to run.
		if (action.type === 'append') {
			return {
				...state,
				text: `${state.text || defaultText} ${getRandomWord()}`,
			};
		}

		return state || {};
	}

	class ReduxVanilla extends HTMLElement {
		constructor() {
			super();

			this.button = document.createElement('button');
			this.button.innerText = '...';

			this.prose = document.createElement('div');

			const root = document.createElement('div');

			root.appendChild(this.prose);
			root.appendChild(this.button);

			this.attachShadow({mode: 'open'}).appendChild(root);

			this.append = this.append.bind(this);
		}

		append() {
			this.dispatch({type: 'append'});
		}

		connectedCallback() {
			this.button.addEventListener('click', this.append);

			const descriptor = this.getAttribute('store-descriptor');

			const State = lookupDescriptor(descriptor);

			const Store = State.get('default');

			// Note: normally you would configure this somewhere outside your
			// component, but for the purposes of seeing this work in DXP we're
			// just going to do it here.

			const {reducer: baseReducer, store} = Store;

			const {dispatch, getState, replaceReducer, subscribe} = store;

			replaceReducer(State.Util.reduceReducers([baseReducer, reducer]));

			this.dispatch = dispatch;

			this.unsubscribe = subscribe(() => {
				this.prose.innerText = getState().text;
			});

			// Normally wouldn't need this (because would set up state
			// elsewhere), but the demo seeding the initial state here.

			this.append();
		}

		disconnectedCallback() {
			this.button.removeEventListener('click', this.append);

			this.unsubscribe();
		}
	}

	if (customElements.get('redux-vanilla')) {
		console.log(
			'Skipping registration for <redux-vanilla> (already registered)'
		);
	} else {
		customElements.define('redux-vanilla', ReduxVanilla);
	}
})();
