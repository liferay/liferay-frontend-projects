/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION =
	'Direct usage of the `fetch` API is discouraged in favour of our wrapped version that takes care of the necessary security configuration; import fetch from frontend-js-web instead';

module.exports = {
	meta: {
		docs: {
			description: DESCRIPTION,
			category: 'Best Practices',
			recommended: false,
			url: 'https://issues.liferay.com/browse/LPS-98283',
		},
		fixable: null,
		messages: {
			noGlobalFetch: DESCRIPTION,
		},
		schema: [],
		type: 'problem',
	},

	create(context) {
		let foundFetchImport = false;

		return {
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'fetch' &&
					!foundFetchImport
				) {
					context.report({
						messageId: 'noGlobalFetch',
						node,
					});
				}
			},

			ImportDeclaration(node) {
				if (
					node.source &&
					node.source.type === 'Literal' &&
					node.source.value === 'frontend-js-web' &&
					node.specifiers.find(
						specifier => specifier.imported.name === 'fetch'
					)
				) {
					foundFetchImport = true;
				}
			},
		};
	},
};
