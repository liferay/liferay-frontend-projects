/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'classes in className attribute must be trimmed and sorted';

module.exports = {
	create(context) {
		const check = (node, value, delimiter) => {
			const expected = value
				.trim()
				.split(/\s+/)
				.sort()
				.join(' ');

			if (value !== expected) {
				context.report({
					fix: fixer => [
						fixer.replaceText(
							node,
							`${delimiter}${expected}${delimiter}`
						),
					],
					message: DESCRIPTION,
					node,
				});
			}
		};

		return {
			JSXAttribute(node) {
				if (node.name.name !== 'className' || !node.value) {
					return;
				}

				if (node.value.type === 'JSXExpressionContainer') {
					if (
						node.value.expression.type === 'Literal' &&
						typeof node.value.expression.value === 'string'
					) {
						const {raw, value} = node.value.expression;

						check(node.value.expression, value, raw.charAt(0));
					} else if (
						node.value.expression.type === 'TemplateLiteral' &&
						node.value.expression.expressions.length === 0
					) {
						const {raw} = node.value.expression.quasis[0].value;

						check(node.value.expression, raw, '`');
					}
				} else if (
					node.value.type === 'Literal' &&
					typeof node.value.value === 'string'
				) {
					const {raw, value} = node.value;

					check(node.value, value, raw.charAt(0));
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
			url: 'https://github.com/liferay/eslint-config-liferay/issues/108',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
