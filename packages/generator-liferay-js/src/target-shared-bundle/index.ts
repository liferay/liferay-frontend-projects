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
	initializing(): void {
		this.composeWith(require.resolve('../facet-project'), undefined);
		this.composeWith(require.resolve('../facet-localization'), undefined);
		this.composeWith(require.resolve('../facet-deploy'), undefined);
		this.composeWith(require.resolve('./shared-bundle'), undefined);
	}

	/**
	 * Standard Yeoman dependencies installation function
	 */
	install(): void {
		this.installDependencies({
			bower: false,
			skipInstall: this.options['skip-install'],
			skipMessage: this.options['skip-install-message'],
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
	}
}

module.exports = exports['default'];
