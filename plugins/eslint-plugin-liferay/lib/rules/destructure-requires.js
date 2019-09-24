/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'require() statements should use destructuring';

module.exports = {
	create(context) {
		return {
			CallExpression(node) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'require' &&
					node.parent.type === 'MemberExpression' &&
					node.parent.property.type === 'Identifier' &&
					node.parent.parent.type === 'VariableDeclarator'
				) {
					const property = node.parent.property.name;
					const declarator = node.parent.parent;

					const code = context.getSourceCode();

					if (declarator.id.type === 'Identifier') {
						const binding = declarator.id.name;

						if (binding === property) {
							// ie. `thing = require('foo').thing`
							// --> `{thing} = require('foo')`
							context.report({
								fix: fixer => {
									return [
										fixer.replaceText(
											node.parent,
											code.getText(node)
										),
										fixer.replaceText(
											declarator.id,
											`{${property}}`
										),
									];
								},
								message: DESCRIPTION,
								node: declarator,
							});
						} else {
							// ie. `alias = require('foo').thing`
							// --> `{thing: alias} = require('foo')`
							context.report({
								fix: fixer => {
									return [
										fixer.replaceText(
											node.parent,
											code.getText(node)
										),
										fixer.replaceText(
											declarator.id,
											`{${property}: ${binding}}`
										),
									];
								},
								message: DESCRIPTION,
								node: declarator,
							});
						}
					} else if (declarator.id.type === 'ObjectPattern') {
						// ie. `{pattern} = require('foo').thing`
						// --> `{thing: {pattern}} = require('foo')`
						context.report({
							fix: fixer => {
								return [
									fixer.replaceText(
										node.parent,
										code.getText(node)
									),
									fixer.replaceText(
										declarator.id,
										`{${property}: ${code.getText(
											declarator.id
										)}}`
									),
								];
							},
							message: DESCRIPTION,
							node: declarator,
						});
					}
				}
			},
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
		fixable: 'code', // or "code" or "whitespace"
		schema: [],
		type: 'problem',
	},
};
