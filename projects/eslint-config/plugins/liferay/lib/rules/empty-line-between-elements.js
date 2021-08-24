/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const message = 'Expected an empty line between sibling elements.';

module.exports = {
	create(context) {
		return {
			JSXElement(node) {
				let previousNodeEndLocation;

				const printTabs = (amountOfTabs) => {
					let tabs = '';

					for (let i = 0; i < amountOfTabs; i++) {
						tabs += '\t';
					}

					return tabs;
				};

				node.children.map((childNode) => {
					if (childNode.type === 'JSXElement') {
						if (
							previousNodeEndLocation + 1 ===
							childNode.loc.start.line
						) {
							context.report({
								fix: (fixer) =>
									fixer.insertTextBefore(
										childNode,
										`\n${printTabs(
											childNode.loc.start.col
										)}`
									),
								message:
									'Expected an empty line between sibling elements.',
								node: childNode,
							});
						}

						previousNodeEndLocation = childNode.loc.end.line;
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
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/618',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
