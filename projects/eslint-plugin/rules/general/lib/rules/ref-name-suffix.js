/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'useRef values should be suffixed with `Ref`';

const NAME_PATTERN = /.*Ref/;

module.exports = {
	create(context) {
		return {
			VariableDeclarator(node) {
				if (
					node.init &&
					node.init.type === 'CallExpression' &&
					(node.init.callee.name === 'useRef' ||
						(node.init.callee.type === 'MemberExpression' &&
							node.init.callee.object.name === 'React' &&
							node.init.callee.property.name === 'useRef'))
				) {
					const variableName = node.id.name;

					if (
						variableName !== 'ref' &&
						!variableName.match(NAME_PATTERN)
					) {
						context.report({
							fix: (fixer) => {
								return fixer.replaceText(
									node.id,
									variableName + 'Ref'
								);
							},
							message: DESCRIPTION,
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
			description: DESCRIPTION,
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
