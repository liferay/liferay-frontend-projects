/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const DESCRIPTION =
	'`liferay/react` and `liferay/portal` apply automatically and can be omitted';

const messageId = 'noExplicitExtend';

/**
 * Expects either:
 *
 * - a Set of literals to prune from an ArrayExpression; or:
 * - a Property to prune from an ObjectExpression.
 */
function fix(elementsOrProperty, context, fixer) {
	const source = context.getSourceCode();

	let items;

	if (elementsOrProperty instanceof Set) {
		// Removing elements from an ArrayExpression.
		let parent;

		for (const node of elementsOrProperty) {
			parent = node.parent;

			break;
		}

		items = parent.elements.slice();
	} else {
		// Removing property from an ObjectExpression.
		const parent = elementsOrProperty.parent;

		// Special case: when removing last property, kill all
		// internal whitespace.
		if (parent.properties.length === 1) {
			return fixer.replaceText(parent, '{}');
		}

		elementsOrProperty = new Set([elementsOrProperty]);
		items = parent.properties.slice();
	}

	const lastIndex = items.length - 1;
	const start = items[0].range[0];
	const end = items[lastIndex].range[1];

	const lastVisible = items.reduce((last, item, index) => {
		if (elementsOrProperty.has(item)) {
			return last;
		} else {
			return index;
		}
	}, NaN);

	// Remove array elements or an object property, preserving
	// whitespace between items.
	return fixer.replaceTextRange(
		[start, end],
		items.slice().reduce((text, item, index) => {
			const atEnd = index >= lastVisible;
			const itemText = source.getText(item);

			const trailingWhitespace = atEnd
				? ''
				: source
						.getText()
						.slice(item.range[1], items[index + 1].range[0]);

			// When removing last item, we eat preceding
			// whitespace. When removing other items we eat trailing
			// whitespace.
			if (elementsOrProperty.has(item)) {
				return text;
			} else if (index + 1 >= lastVisible) {
				return text + itemText;
			} else {
				return text + itemText + trailingWhitespace;
			}
		}, '')
	);
}

module.exports = {
	create(context) {
		const filename = path.basename(context.getFilename());

		if (filename !== '.eslintrc.js') {
			return {};
		}

		const pendingDeletions = new Map();

		return {
			'ArrayExpression:exit': function(node) {
				if (pendingDeletions.has(node)) {
					// Special case: when removing all array items, remove
					// entire property instead.
					if (
						pendingDeletions.get(node).size === node.elements.length
					) {
						pendingDeletions.set(node.parent, node.parent);
					} else {
						context.report({
							fix: fixer =>
								fix(pendingDeletions.get(node), context, fixer),
							messageId,
							node,
						});
					}
				}
			},

			Literal(node) {
				if (
					node.value !== 'liferay/portal' &&
					node.value !== 'liferay/react'
				) {
					return;
				}

				if (
					node.parent &&
					node.parent.type === 'ArrayExpression' &&
					node.parent.parent &&
					node.parent.parent.type === 'Property' &&
					node.parent.parent.key &&
					node.parent.parent.key.type === 'Identifier' &&
					node.parent.parent.key.name === 'extends'
				) {
					if (!pendingDeletions.has(node.parent)) {
						pendingDeletions.set(node.parent, new Set());
					}

					pendingDeletions.get(node.parent).add(node);
				} else if (
					node.parent &&
					node.parent.type === 'Property' &&
					node.parent.key &&
					node.parent.key.type === 'Identifier' &&
					node.parent.key.name === 'extends'
				) {
					pendingDeletions.set(node.parent, node);
				}
			},

			'Property:exit': function(node) {
				if (pendingDeletions.has(node)) {
					context.report({
						fix: fixer => fix(node, context, fixer),
						messageId,
						node,
					});
				}
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
			url: 'https://github.com/liferay/eslint-config-liferay/pull/53',
		},
		fixable: 'code',
		messages: {
			noExplicitExtend: DESCRIPTION,
		},
		schema: [],
		type: 'problem',
	},
};
