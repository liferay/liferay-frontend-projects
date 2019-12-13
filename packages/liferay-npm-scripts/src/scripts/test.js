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

const BABEL_CONFIG = getMergedConfig('babel');
const JEST_CONFIG = getMergedConfig('jest');
const PREFIX_BACKUP = 'TEMP-';

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function(arrArgs = []) {
	const useSoy = soyExists();

	const CONFIG_PATH = 'TEMP_jest.config.json';

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(JEST_CONFIG));
	setBabelConfig();

	const {dispose} = SignalHandler.onExit(() => {
		fs.unlinkSync(CONFIG_PATH);
		removeBabelConfig();
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

		spawnSync('jest', ['--config', CONFIG_PATH, ...arrArgs.slice(1)], {
			env
		});

		if (useSoy) {
			cleanSoy();
		}
	} finally {
		dispose();
	}
};

function setBabelConfig() {
	if (fs.existsSync('.babelrc')) {
		fs.renameSync('.babelrc', PREFIX_BACKUP + '.babelrc');
	}

	if (fs.existsSync('package.json')) {
		const config = JSON.parse(fs.readFileSync('package.json', 'utf8'));

		if (config && config['babel']) {
			config[PREFIX_BACKUP + 'babel'] = config['babel'];

			delete config['babel'];

			fs.writeFileSync(
				'package.json',
				JSON.stringify(config, null, '\t')
			);
		}
	}

	fs.writeFileSync('.babelrc', JSON.stringify(BABEL_CONFIG));
}

function removeBabelConfig() {
	fs.unlinkSync('.babelrc');

	const filePath = PREFIX_BACKUP + '.babelrc';

	if (fs.existsSync(filePath)) {
		fs.renameSync(filePath, '.babelrc');
	}

	if (fs.existsSync('package.json')) {
		const configFile = fs.readFileSync('package.json', 'utf8');
		const config = JSON.parse(configFile);

		if (config && config[PREFIX_BACKUP + 'babel']) {
			config['babel'] = config[PREFIX_BACKUP + 'babel'];

			delete config[PREFIX_BACKUP + 'babel'];

			fs.writeFileSync(
				'package.json',
				JSON.stringify(config, null, '\t')
			);
		}
	}
}
