/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('prettier');

/**
 * Custom Prettier wrapper that applies a Liferay-specific
 * post-processing step.
 */
module.exports = {
	check(...args) {
		return prettier.check(...args);
	},

	format(...args) {
		return prettier.format(...args);
	},
};
