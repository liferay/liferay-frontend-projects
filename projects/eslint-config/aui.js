/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const local = require('./utils/local');

const config = {
	extends: [require.resolve('./react')],
	plugins: [local('@liferay/portal')],
	rules: {
		'@liferay/aui/no-all': 'error',
		'@liferay/aui/no-array': 'error',
		'@liferay/aui/no-each': 'error',
		'@liferay/aui/no-get-body': 'error',
		'@liferay/aui/no-io': 'error',
		'@liferay/aui/no-merge': 'error',
		'@liferay/aui/no-modal': 'error',
		'@liferay/aui/no-node': 'error',
		'@liferay/aui/no-object': 'error',
		'@liferay/aui/no-one': 'error',
	},
};

module.exports = config;
