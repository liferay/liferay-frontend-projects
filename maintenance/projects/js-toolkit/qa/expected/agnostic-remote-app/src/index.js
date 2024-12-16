import React from 'react';
import ReactDOM from 'react-dom';

import AppComponent from './AppComponent';

class CustomElement extends HTMLElement {
	constructor() {
		super();

		const root = document.createElement('div');

		ReactDOM.render(
			<AppComponent/>, 
			root
		);

		this.appendChild(root);
	}

	connectedCallback() {
	}

	disconnectedCallback() {
	}

}

if (customElements.get('agnostic-remote-app-element')) {
	console.log(
		'Skipping registration for <agnostic-remote-app-element> (already registered)'
	);
} else {
	customElements.define('agnostic-remote-app-element', CustomElement);
}
