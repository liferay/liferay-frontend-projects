/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const message = 'prefer using .length instead of .length === 0 or .length > 0';

module.exports = {
	create(context) {
		return {
			BinaryExpression(node) {
				const {left, operator, right} = node;
				const STRICT_EQUALITY = '===';
				const MORE_THAN = '>';
				const LENGTH = 'length';

				if (
					operator &&
					left.property &&
					left.property.name === LENGTH &&
					right.value === 0
				) {
					if (
						operator === STRICT_EQUALITY ||
						operator === MORE_THAN
					) {
						const source = context.getSourceCode();
						let replacement;

						if (operator === STRICT_EQUALITY) {
							replacement = `!${source.getText(left)}`;
						}
						else {
							replacement = `!!${source.getText(left)}`;
						}

						context.report({
							fix: (fixer) => {
								return fixer.replaceText(node, replacement);
							},
							message,
							node,
						});
					}
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
				'https://github.com/liferay/liferay-frontend-projects/issues/19',
		},
		fixable: true,
		schema: [],
		type: 'problem',
	},
};
