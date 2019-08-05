/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Helper method that will complain noisily if we pass a non-strict version
 * specifier (eg. "^1.0.0", "~1.0.0", ">1.0.0" etc).
 */
function strict(version) {
	if (!version.match(/^\d/)) {
		throw new Error(`Version ${version} is not strict`);
	}

	return version;
}

module.exports = {
	default: {
		gulp: '3.9.1',
		'liferay-theme-tasks': '^9.4.0',
		'compass-mixins': strict('0.12.10'),
		'liferay-frontend-common-css': strict('1.0.4'),
		'liferay-frontend-theme-styled': strict('4.0.7'),
		'liferay-frontend-theme-unstyled': strict('4.0.4'),
	},
	optional: {
		'liferay-font-awesome': strict('3.4.0'),
	},
};
