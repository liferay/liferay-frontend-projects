/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

const DESCRIPTION = 'do not make explicit references to localhost.';

module.exports = {
	create(context) {
		const filePath = context.getFilename();
		const filename = path.basename(filePath);

		if (
			filename.includes('webpack') ||
			filename.includes('jest') ||
			filePath.includes('test')
		) {
			return {};
		}

		return {
			Literal(node) {
				if (
					node &&
					node.value &&
					typeof node.value.includes === 'function' &&
					node.value.includes('localhost')
				) {
					context.report({
						message: DESCRIPTION,
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
			url:
				'https://github.com/liferay/liferay-frontend-projects/issues/644',
		},
		fixable: null,
		schema: [],
		type: 'problem',
	},
};
