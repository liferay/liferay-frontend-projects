import Generator from 'yeoman-generator';

import * as standardTarget from '../utils/target/standard';

/**
 * Generator for React portlets.
 */
export default class ThisGenerator extends Generator {
	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		standardTarget.initializing(this);

		this.composeWith(require.resolve('./react-portlet'));
	}

	/**
	 * Standard Yeoman install function
	 */
	install() {
		standardTarget.install(this);
	}
}
