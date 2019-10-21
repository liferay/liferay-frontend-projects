/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {checkJSXAttribute} = require('../common/className');

const DESCRIPTION = 'classes in className attribute must be trimmed and sorted';

module.exports = {
	create(context) {
		const check = (node, value, delimiter) => {
			const expected = value
				.trim()
				.split(/\s+/)
				.sort()
				.join(' ');

			if (value !== expected) {
				context.report({
					fix: fixer => [
						fixer.replaceText(
							node,
							`${delimiter}${expected}${delimiter}`
						),
					],
					message: DESCRIPTION,
					node,
				});
			}
		};

		return {
			JSXAttribute(node) {
				checkJSXAttribute(node, check);
			},
		};
	},

	meta: {
		docs: {
			category: 'Best Practices',
			description: DESCRIPTION,
			recommended: false,
			url: 'https://github.com/liferay/eslint-config-liferay/issues/108',
		},
		fixable: 'code',
		schema: [],
		type: 'problem',
	},
};
