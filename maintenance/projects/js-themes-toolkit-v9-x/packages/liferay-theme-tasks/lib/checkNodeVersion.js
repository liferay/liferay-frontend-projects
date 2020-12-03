/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * Rather than checking for a specific version of NodeJS, we check for features
 * that we expect to be present.
 */
function checkNodeVersion() {
	const REQUIREMENTS = [
		// Added to NodeJS v7: https://nodejs.org/fa/blog/release/v7.0.0/
		() => !!Object.values,
	];

	if (!REQUIREMENTS.every(Boolean)) {
		// eslint-disable-next-line no-console
		console.log(
			'warning: liferay-theme-tasks requires a more recent version ' +
				'of NodeJS - please consider upgrading: ' +
				'https://nodejs.org/en/about/releases/'
		);
	}
}

module.exports = checkNodeVersion;
