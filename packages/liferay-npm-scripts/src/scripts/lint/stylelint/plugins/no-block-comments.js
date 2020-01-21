/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const stylelint = require('stylelint');

const ruleName = 'liferay/no-block-comments';

const messages = stylelint.utils.ruleMessages(ruleName, {
	expected:
		'No block-based comments (/* ... */); use line-based (//) comment syntax instead'
});

module.exports = stylelint.createPlugin(ruleName, actual => {
	return function(root, result) {
		const validOptions = stylelint.utils.validateOptions(result, ruleName, {
			actual
		});

		if (!validOptions) {
			return;
		}

		root.walkComments(comment => {
			if (!comment.raws.inline) {
				stylelint.utils.report({
					message: messages.expected,
					node: comment,
					result,
					ruleName
				});
			}
		});
	};
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
