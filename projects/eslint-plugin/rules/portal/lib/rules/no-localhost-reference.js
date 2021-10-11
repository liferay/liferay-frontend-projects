/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const DESCRIPTION = 'do not make explicit references to localhost.';

module.exports = {
	create(context) {
		const filename = path.basename(context.getFilename());

		return {
			Literal(node) {
				if (filename.includes('webpack') || filename.includes('jest')) {
					return;
				}

				if (node.value.match(/.*localhost.*/)) {
					context.report({
						message: DESCRIPTION,
						node: node.parent,
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
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/644',
		},
		fixable: null,
		schema: [],
		type: 'problem',
	},
};
