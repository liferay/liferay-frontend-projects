/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	create(context) {
		const sourceCode = context.getSourceCode();

		return {
			CallExpression(node) {
				if (
					node.callee &&
					node.callee.type === 'MemberExpression' &&
					node.callee.property &&
					node.callee.property.name === 'getAttribute' &&
					node.arguments &&
					node.arguments[0] &&
					node.arguments[0].value &&
					node.arguments[0].value.startsWith('data-')
				) {
					const argumentValue = node.arguments[0].value;

					const argumentName = argumentValue.replace('data-', '');

					const replacementString = argumentName.includes('-')
						? `['${argumentName}']`
						: '.' + argumentName;
					context.report({
						fix: (fixer) => {
							if (node.callee.object.type === 'Identifier') {
								return fixer.replaceText(
									node,
									`${node.callee.object.name}.dataset${replacementString}`
								);
							}
							else if (
								node.callee.object.type === 'MemberExpression'
							) {
								const memberExpressionString = sourceCode.getText(
									node.callee.object
								);

								return fixer.replaceText(
									node,
									`${memberExpressionString}.dataset${replacementString}`
								);
							}
						},
						message: `Use "dataset${replacementString}" instead of "getAttribute('${argumentValue}')"`,
						node: node.callee.property,
					});
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: 'use dataset instead of getAttribute("data-*")',
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/311',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
