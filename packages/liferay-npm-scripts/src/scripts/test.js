/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/get-merged-config');
const {buildSoy, cleanSoy, soyExists} = require('../utils/soy');
const spawnSync = require('../utils/spawn-sync');
const withBabelConfig = require('../utils/with-babel-config');

const JEST_CONFIG = getMergedConfig('jest');

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function(arrArgs = []) {
	const useSoy = soyExists();

	const CONFIG_PATH = path.join(CWD, 'TEMP_jest.config.json');

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(JEST_CONFIG));

	if (useSoy) {
		buildSoy();
	}

	withBabelConfig(() => {
		spawnSync('jest', ['--config', CONFIG_PATH, ...arrArgs.slice(1)]);
	});

	if (useSoy) {
		cleanSoy();
	}

	fs.unlinkSync(CONFIG_PATH);
};
