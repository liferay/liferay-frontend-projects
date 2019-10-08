#!/usr/bin/env node

/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const config = require('../packages/liferay-npm-scripts/src/config/babel.json');
const log = require('../packages/liferay-npm-scripts/src/utils/log');
const deepMerge = require('../packages/liferay-npm-scripts/src/utils/deepMerge');

try {
	// Merging the config with itself will force us to visit and check the
	// entire thing.
	deepMerge([config, config], deepMerge.MODE.BABEL);
} catch (error) {
	log(
		'Problem found while checking liferay-npm-scripts/src/config/babel.json'
	);

	throw error;
}
