/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION =
	'functions returned by require() should be assigned to a variable before calling';

module.exports = {
	create(context) {
		const scope = [];

		const enterScope = node => scope.push(node);
		const exitScope = () => scope.pop();

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

				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require' &&
					node.parent.type === 'CallExpression'
				) {
					context.report({
						message: DESCRIPTION,
						node: node.parent,
					});
				}
			},

			FunctionDeclaration: enterScope,
			'FunctionDeclaration:exit': exitScope,

			FunctionExpression: enterScope,
			'FunctionExpression:exit': exitScope,

			ObjectExpression: enterScope,
			'ObjectExpression:exit': exitScope,
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-guidelines/blob/master/general/imports.md',
		},
		fixable: null,
		schema: [],
		type: 'problem',
	},
};
