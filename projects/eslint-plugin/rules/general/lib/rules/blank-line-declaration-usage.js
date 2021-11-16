/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const message =
	'Expected an empty line between variable declaration and usage.';

module.exports = {
	create(context) {
		const sourceCode = context.getSourceCode();

		return {
			VariableDeclaration(node) {
				if (
					node.parent.type === 'ForStatement' ||
					node.parent.type === 'ForInStatement' ||
					node.parent.type === 'ForOfStatement' ||
					node.parent.type === 'WhileStatement'
				) {
					return;
				}

				const varsDeclaredOnLine = context.getDeclaredVariables(node);

				const declarationLine =
					varsDeclaredOnLine[0].identifiers[0].loc.start.line;

				varsDeclaredOnLine.forEach((reference) => {
					const varReference = reference.references[1];

					if (varReference === undefined) {
						return;
					}

					const referenceLine =
						varReference.identifier.loc.start.line;

					if (
						sourceCode.lines
							.slice(declarationLine, referenceLine - 1)
							.indexOf('') === -1
					) {
						context.report({
							fix: (fixer) => {
								const declarationEndLine = node.loc.end.line;

								if (referenceLine === declarationEndLine + 1) {
									return fixer.insertTextAfter(node, '\n');
								}
							},
							message,
							node: reference.references[1].identifier,
						});
					}
				});
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: message,
			recommended: false,
			url: 'https://github.com/liferay/eslint-config-liferay/issues/139',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
