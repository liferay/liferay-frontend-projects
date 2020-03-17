/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const pkgJson = require('../package.json');

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

// Define versions that are common to every Liferay DXP version and project type
const gulpVersion = '4.0.2';
const themeTasksVersion = `^${pkgJson.version}`;

// Define dependencies for each Liferay DXP version and project type
/* eslint-disable quote-props */
module.exports = {
	layout: {
		'7.2': {
			default: {
				gulp: gulpVersion,
				'liferay-theme-tasks': themeTasksVersion,
			},
		},
		'7.3': {
			default: {
				gulp: gulpVersion,
				'liferay-theme-tasks': themeTasksVersion,
			},
		},
	},
	theme: {
		'7.2': {
			default: {
				'compass-mixins': strict('0.12.10'),
				gulp: gulpVersion,
				'liferay-frontend-common-css': strict('1.0.4'),
				'liferay-frontend-theme-styled': strict('4.0.21'),
				'liferay-frontend-theme-unstyled': strict('4.0.17'),
				'liferay-theme-tasks': themeTasksVersion,
			},
			optional: {
				'liferay-font-awesome': strict('3.4.0'),
			},
		},
		'7.3': {
			default: {
				'compass-mixins': strict('0.12.10'),
				gulp: gulpVersion,
				'liferay-frontend-common-css': strict('1.0.4'),
				'liferay-frontend-theme-styled': strict('5.0.0'),
				'liferay-frontend-theme-unstyled': strict('5.0.0'),
				'liferay-theme-tasks': themeTasksVersion,
			},
			optional: {
				'liferay-font-awesome': strict('3.4.0'),
			},
		},
	},
};
/* eslint-enable quote-props */
