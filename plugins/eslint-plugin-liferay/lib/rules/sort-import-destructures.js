/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const DESCRIPTION = 'destructured names in imports must be sorted';

module.exports = {
	create(context) {
		return {
			ImportDeclaration(node) {
				const specifiers = node.specifiers.filter(specifier => {
					// Just `ImportSpecifier` (ignore `ImportDefaultSpecifier`).
					return specifier.type === 'ImportSpecifier';
				});

				if (specifiers.length > 1) {
					const source = context.getSourceCode();

					if (
						source.commentsExistBetween(
							source.getTokenBefore(specifiers[0]),
							node.source
						)
					) {
						// Don't touch if any of the specifiers have
						// comments.
						return;
					}

					let fix;

					// Given:
					//
					//      import {a as b, c} from 'd';
					//
					// We'll have two specifiers:
					//
					// - `imported.name === 'a'`, `local.name === 'b').
					// - `imported.name === 'c'`.
					//
					// We sort by `imported` always, ignoring `local`.
					const sorted = specifiers.slice().sort((a, b) => {
						const order =
							a.imported.name > b.imported.name ? 1 : -1;

						if (order === 1) {
							fix = true;
						}

						return order;
					});

					if (fix) {
						const text =
							' '.repeat(node.start) + source.getText(node);

						const start = specifiers[0].start;
						const end = specifiers[specifiers.length - 1].end;

						let fixed = '';

						for (let i = 0; i < specifiers.length; i++) {
							fixed += source.getText(sorted[i]);

							if (i < specifiers.length - 1) {
								// Grab all text between specifier and next.
								const between = text.slice(
									specifiers[i].end,
									specifiers[i + 1].start
								);

								fixed += between;
							}
						}

						context.report({
							fix: fixer =>
								fixer.replaceTextRange([start, end], fixed),
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
			recommended: false,
			url: 'https://github.com/liferay/eslint-config-liferay/issues/124',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
