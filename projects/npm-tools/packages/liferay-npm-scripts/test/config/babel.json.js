/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const config = require('../../src/config/babel.json');
const deepMerge = require('../../src/utils/deepMerge');

describe('babel.json', () => {
	it('is valid', () => {
		expect(() => {
			// Merging the config with itself will force us to visit and
			// check the entire thing.

			deepMerge([config, config], deepMerge.MODE.BABEL);
		}).not.toThrow();
	});
});
