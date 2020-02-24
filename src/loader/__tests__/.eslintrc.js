/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-env node */

module.exports = {
	env: {
		jest: true,
		node: true,
	},
	extends: '../.eslintrc.js',
	rules: {
		'require-jsdoc': 'off',
	},
};
