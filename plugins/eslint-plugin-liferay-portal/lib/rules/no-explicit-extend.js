/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const DESCRIPTION = '`liferay/portal` applies automatically and can be omitted';

/**
 * Returns the corresponding Property if `node` is found to be inside an
 * ObjectExpression like this:
 *
 *     {
 *         extends: ['liferay/portal']
 *     }   ^        ^----------------^
 *         |                |
 *         |               node      ^
 *         |                         |
 *         ^-------------------------^
 *                      |
 *                  property
 */
function extractFromObjectExpression(node) {
	const maybeProperty = node.parent;

	if (
		maybeProperty &&
		maybeProperty.type === 'Property' &&
		maybeProperty.key &&
		maybeProperty.key.type === 'Identifier' &&
		maybeProperty.key.name === 'extends'
	) {
		return maybeProperty;
	}
}

/**
 * Returns the corresponding Literal if `node` is found to be inside an
 * ArrayExpression like this:
 *
 *     {
 *         extends: ['foo', 'liferay/portal', 'bar']
 *     }                    ^--------------^
 *                                 |
 *                                node
 *
 * If `node` is not in an ArrayExpression, falls back to trying to locate it in
 * an ObjectExpression like this:
 *
 *     {
 *         extends: 'liferay/portal'
 *     }            ^--------------^
 *                         |
 *                        node
 */
function extractFromArrayExpression(node) {
	const maybeArray = node.parent;

	if (maybeArray && maybeArray.type === 'ArrayExpression') {
		const extracted = extractFromObjectExpression(maybeArray);

		if (extracted) {
			if (maybeArray.elements.length === 1) {
				// Removing the node from the array would leave an empty array,
				// so remove the entire property instead.
				return extracted;
			} else {
				// Just remove the node from the array.
				return node;
			}
		}
	} else {
		return extractFromObjectExpression(node);
	}
}

function fix(elementOrProperty, context, fixer) {
	const source = context.getSourceCode();

	let items;
	let start;

	if (elementOrProperty.type === 'Property') {
		items = elementOrProperty.parent.properties;

		// Special case: when removing last property, kill all internal
		// whitespace.
		if (
			items.length === 1 &&
			elementOrProperty.parent &&
			elementOrProperty.parent.type === 'ObjectExpression'
		) {
			return fixer.replaceText(elementOrProperty.parent, '{}');
		}

		start = elementOrProperty.parent.properties[0].range[0];
	} else {
		items = elementOrProperty.parent.elements;
		start = elementOrProperty.parent.elements[0].range[0];
	}

	const removeIndex = items.indexOf(elementOrProperty);
	const lastIndex = items.length - 1;
	const removeLast = removeIndex === lastIndex;

	const end = items[lastIndex].range[1];

	// Remove array element or object property, preserving whitespace between
	// items.
	return fixer.replaceTextRange(
		[start, end],
		items.slice().reduce((text, item, index) => {
			const atEnd = index === lastIndex;
			const itemText = source.getText(item);

			// When removing last item, we eat preceding
			// whitespace. When removing other items we eat
			// trailing whitespace.
			const trailingWhitespace = atEnd
				? ''
				: source
						.getText()
						.slice(item.range[1], items[index + 1].range[0]);

			if (index !== removeIndex) {
				if (index + 1 === lastIndex && removeLast) {
					text += itemText;
				} else {
					text += itemText + trailingWhitespace;
				}
			}

			return text;
		}, '')
	);
}

module.exports = {
	meta: {
		docs: {
			description: DESCRIPTION,
			category: 'Best Practices',
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

	create(context) {
		const filename = path.basename(context.getFilename());

		if (filename !== '.eslintrc.js') {
			return {};
		}

		return {
			Literal(node) {
				if (node.value !== 'liferay/portal') {
					return;
				}

				/**
				 * Extract a removable node, which will either be a
				 * 'liferay/portal' string literal, or an object property
				 * containing the same.
				 */
				const extracted =
					extractFromArrayExpression(node) ||
					extractFromObjectExpression(node);

				if (extracted) {
					context.report({
						fix: fixer => fix(extracted, context, fixer),
						messageId: 'noExplicitExtend',
						node,
					});
				}
			},
		};
	},
};
