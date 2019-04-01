/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const CWD = process.cwd();

const spawnSync = require('../utils/spawnSync');
const fs = require('fs');
const path = require('path');

const {buildSoy, cleanSoy, soyExists} = require('./soy');
const getMergedConfig = require('../utils/get-merged-config');
const {removeBabelConfig, setBabelConfig} = require('./babel');

const JEST_CONFIG = getMergedConfig('jest');

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function(arrArgs = []) {
	const useSoy = soyExists();

	const CONFIG_PATH = path.join(CWD, 'TEMP_jest.config.json');

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(JEST_CONFIG));

	setBabelConfig();

	if (useSoy) {
		buildSoy();
	}

	spawnSync('jest', ['--config', CONFIG_PATH, ...arrArgs.slice(1)]);

	if (useSoy) {
		cleanSoy();
	}

	removeBabelConfig();

	fs.unlinkSync(CONFIG_PATH);
};
