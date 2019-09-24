/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {
	getRequireStatement,
	getSource,
	isRequireStatement,
} = require('../common/imports');

module.exports = {
	create(context) {
		const scope = [];

		const enterScope = node => scope.push(node);
		const exitScope = () => scope.pop();

		let lastImportIndex = -1;
		let lastNonImportIndex = -1;

		function isImportDeclaration(node) {
			return node && node.type === 'ImportDeclaration';
		}

		function isRequireExpression(node) {
			return (
				node &&
				node.type === 'ExpressionStatement' &&
				node.expression.type === 'CallExpression' &&
				node.expression.callee.name === 'require'
			);
		}

		function check(node) {
			let current = node;

			while (current) {
				if (lastNonImportIndex === -1) {
					// Haven't seen a non-import yet, so must search.
					const token = context.getTokenBefore(current);

					if (!token) {
						break;
					}

					current = context.getNodeByRangeIndex(token.range[0]);

					if (
						isRequireExpression(current) ||
						isRequireStatement(current) ||
						isImportDeclaration(current)
					) {
						if (token.range[1] <= lastImportIndex) {
							// This is a known-good import, so we can stop.
							break;
						} else {
							lastImportIndex = current.range[1];
							continue;
						}
					}

					lastNonImportIndex = token.range[1];
				}

				context.report({
					message: `import of ${JSON.stringify(
						getSource(node)
					)} must come before other statements`,
					node,
				});

				break;
			}
		}

		return {
			ArrowFunctionExpression: enterScope,
			'ArrowFunctionExpression:exit': exitScope,

			BlockStatement: enterScope,
			'BlockStatement:exit': exitScope,

			CallExpression(node) {
				if (scope.length) {
					// Only consider `require` calls at the top level.
					return;
				}

				check(getRequireStatement(node));
			},

			FunctionDeclaration: enterScope,
			'FunctionDeclaration:exit': exitScope,

			FunctionExpression: enterScope,
			'FunctionExpression:exit': exitScope,

			ImportDeclaration(node) {
				check(node);
			},

			ObjectExpression: enterScope,
			'ObjectExpression:exit': exitScope,
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: 'imports must come before other statements',
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-guidelines/issues/60',
		},
		fixable: null,
		schema: [],
		type: 'problem',
	},
};
