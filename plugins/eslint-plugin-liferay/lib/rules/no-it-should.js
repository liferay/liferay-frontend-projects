/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'it() strings should not start with "should"';

module.exports = {
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'it'
				) {
					const argument = node.arguments && node.arguments[0];
					if (
						argument &&
						argument.type === 'Literal' &&
						typeof argument.value === 'string' &&
						argument.value.match(/^\s*should/)
					) {
						context.report({
							message: DESCRIPTION,
							node: argument,
						});
					}
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Test style',
			description: DESCRIPTION,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-guidelines/blob/master/guidelines/general/testing.md#start-it-descriptions-with-a-verb-not-with-should',
		},
		fixable: null, // or "code" or "whitespace"
		schema: [],
		type: 'suggestion',
	},
};
