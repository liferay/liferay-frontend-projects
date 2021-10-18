/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MESSAGE = 'Every `expect()` should assert something.';

module.exports = {
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.name === 'expect' &&
					node.parent &&
					node.parent.type !== 'MemberExpression' &&
					!node.parent.property
				) {
					context.report({
						message: MESSAGE,
						node,
					});
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: MESSAGE,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/6',
		},
		schema: [],
		type: 'problem',
	},
};
