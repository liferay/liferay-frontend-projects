/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = {
	modulePathIgnorePatterns: [
		'lib/.*',
		'generators/.*',
		'qa/.*',
		'__fixtures__/.*',
	],
	testPathIgnorePatterns: ['/qa/samples/', '/__fixtures__/'],
	transform: {
		'\\.js$': 'ts-jest',
		'\\.ts$': 'ts-jest',
	},
};
