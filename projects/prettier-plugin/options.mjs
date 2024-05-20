/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

export const options = {
	commentIgnoreAfterPatterns: {
		array: true,
		category: 'Format',
		description:
			'Ignore line after comment node that contains a given pattern',
		since: '1.0.0',
		type: 'string',
	},
	commentIgnoreBeforePatterns: {
		array: true,
		category: 'Format',
		description:
			'Ignore new line before comment node that contains a given pattern',
		since: '1.0.0',
		type: 'string',
	},
	commentIgnorePatterns: {
		array: true,
		category: 'Format',
		description:
			'Ignore new lines line before and after comment nodes that contain a given pattern',
		since: '1.0.0',
		type: 'string',
	},
};
