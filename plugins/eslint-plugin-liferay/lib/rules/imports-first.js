/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'imports must come before other statements';

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

		function isRequireStatement(node) {
			return (
				(node &&
					node.type === 'VariableDeclaration' &&
					node.declarations[0].init.type === 'CallExpression' &&
					node.declarations[0].init.callee.name === 'require') ||
				(node &&
					node.type === 'VariableDeclaration' &&
					node.declarations[0].init.type === 'MemberExpression' &&
					node.declarations[0].init.object.type ===
						'CallExpression' &&
					node.declarations[0].init.object.callee.name ===
						'require') ||
				(node &&
					node.type === 'VariableDeclaration' &&
					node.declarations[0].init.type === 'CallExpression' &&
					node.declarations[0].init.callee.type ===
						'CallExpression' &&
					node.declarations[0].init.callee.callee.name === 'require')
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
					message: DESCRIPTION,
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

				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require'
				) {
					const argument = node.arguments && node.arguments[0];
					if (
						argument &&
						argument.type === 'Literal' &&
						typeof argument.value === 'string'
					) {
						if (
							node.parent.type === 'CallExpression' &&
							node.parent.parent.type === 'VariableDeclarator' &&
							node.parent.parent.parent.type ===
								'VariableDeclaration'
						) {
							check(node.parent.parent.parent);
						} else if (node.parent.type === 'ExpressionStatement') {
							check(node.parent);
						} else if (
							node.parent.type === 'MemberExpression' &&
							node.parent.parent.type === 'VariableDeclarator' &&
							node.parent.parent.parent.type ===
								'VariableDeclaration'
						) {
							check(node.parent.parent.parent);
						} else if (
							node.parent.type === 'VariableDeclarator' &&
							node.parent.parent.type === 'VariableDeclaration'
						) {
							check(node.parent.parent);
						}
					}
				}
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
			description: DESCRIPTION,
			recommended: false,
			url:
				'https://github.com/liferay/liferay-frontend-guidelines/issues/60',
		},
		fixable: null,
		schema: [],
		type: 'problem',
	},
};
