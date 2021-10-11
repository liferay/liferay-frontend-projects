/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'useState must follow naming pattern `const [* , set*] =`';

const ERROR_ID = 'use-state-naming-pattern';

module.exports = {
	create(context) {
		return {
			CallExpression(node) {
				const reactUseState =
					node.callee.type === 'MemberExpression' &&
					node.callee.object.type === 'Identifier' &&
					node.callee.object.name === 'React' &&
					node.callee.property.type === 'Identifier' &&
					node.callee.property.name === 'useState';

				const plainUseState =
					node.callee.type === 'Identifier' &&
					node.callee.name === 'useState';

				if (!reactUseState && !plainUseState) {
					return;
				}

				const variables =
					node.parent && node.parent.id && node.parent.id.elements;

				if (!variables || variables.length !== 2) {
					return;
				}

				const [valueVariable, setterVariable] = variables;

				if (!setterVariable) {
					return;
				}

				const valueVariableName = valueVariable && valueVariable.name;
				const setterVariableName = setterVariable.name;

				const expectedSetterVariableName = valueVariableName
					? `set${valueVariableName
							.charAt(0)
							.toUpperCase()}${valueVariableName.slice(1)}`
					: undefined;

				if (setterVariableName === expectedSetterVariableName) {
					return;
				}

				const setterStartsWithSet =
					setterVariableName.slice(0, 3) === 'set';

				if (setterStartsWithSet) {
					return;
				}

				context.report({
					fix: valueVariableName
						? (fixer) =>
								fixer.replaceTextRange(
									[
										node.parent.id.range[0],
										node.parent.id.range[1],
									],
									`[${valueVariableName}, ${expectedSetterVariableName}]`
								)
						: undefined,
					messageId: ERROR_ID,
					node: node.parent.id,
				});
			},
		};
	},
	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
		},
		fixable: 'code',
		messages: {
			[ERROR_ID]: DESCRIPTION,
		},
		schema: [],
	},
};
