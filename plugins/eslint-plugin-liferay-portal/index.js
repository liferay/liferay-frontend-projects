/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'no-explicit-extend': require('./lib/rules/no-explicit-extend'),
		'no-metal-plugins': require('./lib/rules/no-metal-plugins'),
		'no-side-navigation': require('./lib/rules/no-side-navigation'),
	},
};
