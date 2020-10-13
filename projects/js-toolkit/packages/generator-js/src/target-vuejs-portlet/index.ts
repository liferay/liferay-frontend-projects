/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Generator from 'yeoman-generator';

import * as standardTarget from '../utils/target/standard';

/**
 * Generator for Vue.js portlets.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing(): void {
		standardTarget.initializing(this);

		this.composeWith(require.resolve('./vuejs-portlet'), undefined);
	}

	/**
	 * Standard Yeoman install function
	 */
	install(): void {
		standardTarget.install(this);
	}
}

module.exports = exports['default'];
