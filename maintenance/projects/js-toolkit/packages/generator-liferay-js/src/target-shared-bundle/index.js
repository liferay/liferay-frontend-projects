/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Generator from 'yeoman-generator';

/**
 * Generator for shared bundles.
 */
export default class extends Generator {

	/**
	 * Standard Yeoman initialization function
	 */
	initializing() {
		this.composeWith(require.resolve('../facet-project'));
		this.composeWith(require.resolve('../facet-localization'));
		this.composeWith(require.resolve('../facet-deploy'));
		this.composeWith(require.resolve('./shared-bundle'));
	}

	/**
	 * Standard Yeoman dependencies installation function
	 */
	install() {
		this.installDependencies({
			bower: false,
			skipMessage: this.options['skip-install-message'],
			skipInstall: this.options['skip-install'],
		});
	}
}

module.exports = exports['default'];
