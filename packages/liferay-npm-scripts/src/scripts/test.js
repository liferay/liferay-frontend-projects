/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../utils/getMergedConfig');
const {buildSoy, cleanSoy, soyExists} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');
const withBabelConfig = require('../utils/withBabelConfig');

const JEST_CONFIG = getMergedConfig('jest');

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function(arrArgs = []) {
	const useSoy = soyExists();

	const CONFIG = JSON.stringify(JEST_CONFIG);

	if (useSoy) {
		buildSoy();
	}

	withBabelConfig(() => {
		spawnSync('jest', ['--config', CONFIG, ...arrArgs.slice(1)]);
	});

	if (useSoy) {
		cleanSoy();
	}
};
