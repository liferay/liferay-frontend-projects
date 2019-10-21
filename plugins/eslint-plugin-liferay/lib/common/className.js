/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * A visitor function that calls `callback` for any "className" `JSXAttribute`.
 */
function checkJSXAttribute(node, callback) {
	if (node.name.name !== 'className' || !node.value) {
		return;
	}

	if (node.value.type === 'JSXExpressionContainer') {
		if (
			node.value.expression.type === 'Literal' &&
			typeof node.value.expression.value === 'string'
		) {
			const {raw, value} = node.value.expression;

			callback(node.value.expression, value, raw.charAt(0));
		} else if (
			node.value.expression.type === 'TemplateLiteral' &&
			node.value.expression.expressions.length === 0
		) {
			const {raw} = node.value.expression.quasis[0].value;

			callback(node.value.expression, raw, '`');
		}
	} else if (
		node.value.type === 'Literal' &&
		typeof node.value.value === 'string'
	) {
		const {raw, value} = node.value;

		callback(node.value, value, raw.charAt(0));
	}
}

module.exports = {
	checkJSXAttribute,
};
