/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const SignalHandler = require('../utils/SignalHandler');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const {buildSoy, cleanSoy, soyExists} = require('../utils/soy');
const spawnSync = require('../utils/spawnSync');
const withBabelConfig = require('../utils/withBabelConfig');

const JEST_CONFIG = getMergedConfig('jest');

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function(arrArgs = []) {
	const useSoy = soyExists();

	const CONFIG_PATH = 'TEMP_jest.config.json';

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(JEST_CONFIG));

	const {dispose} = SignalHandler.onExit(() => {
		fs.unlinkSync(CONFIG_PATH);
	});

	try {
		if (useSoy) {
			buildSoy();
		}

		const env = {
			...process.env,
			NODE_ENV: 'test'
		};

		const {NODE_ENV} = process.env;

		if (!NODE_ENV || NODE_ENV === 'test') {
			log('Using NODE_ENV: "test"');
		} else {
			log(
				`Overriding pre-existing NODE_ENV: ${JSON.stringify(
					NODE_ENV
				)} → "test"`
			);
		}

		withBabelConfig(() => {
			spawnSync('jest', ['--config', CONFIG_PATH, ...arrArgs.slice(1)], {
				env
			});
		});

		if (useSoy) {
			cleanSoy();
		}
	} finally {
		dispose();
	}
};
