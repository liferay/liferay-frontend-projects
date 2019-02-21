import Generator from 'yeoman-generator';

import * as standardTarget from '../utils/target/standard';

/**
 * Generator for vanilla JS portlets.
 */
export default class extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		standardTarget.initializing(this);

		this.composeWith(require.resolve('./vanilla-portlet'));
	}

	/**
	 * Standard Yeoman install function
	 */
	install() {
		standardTarget.install(this);
	}
}
