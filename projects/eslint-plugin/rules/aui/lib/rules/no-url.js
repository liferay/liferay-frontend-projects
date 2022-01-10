/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const message = 'use the vanilla URL class instead of A.Url';

module.exports = {
	create(context) {
		return {
			NewExpression(node) {
				if (
					node.callee.object &&
					node.callee.object.name === 'A' &&
					node.callee.property.name === 'Url'
				) {
					context.report({
						message,
						node,
					});
				}
			},
		};
	},
	meta: {
		docs: {
			category: 'Best Practices',
			description: message,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/652',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
