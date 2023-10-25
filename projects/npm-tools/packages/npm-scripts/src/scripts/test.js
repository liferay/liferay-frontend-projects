/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const SignalHandler = require('../utils/SignalHandler');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

const BABEL_CONFIG = getMergedConfig('babel');
const JEST_CONFIG = getMergedConfig('jest');

const CONFIG_FILE_NAME = '.babelrc.js';
const PREFIX_BACKUP = 'TEMP-';

/**
 * Main script that runs `jest` with a merged config
 */
module.exports = function (arrArgs = []) {
	const CONFIG_PATH = 'TEMP_jest.config.json';

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(JEST_CONFIG));
	setBabelConfig();

	const {dispose} = SignalHandler.onExit(() => {
		fs.unlinkSync(CONFIG_PATH);
		removeBabelConfig();
	});

	try {
		const env = {
			...process.env,
			NODE_ENV: 'test',
		};

		const {NODE_ENV} = process.env;

		if (!NODE_ENV || NODE_ENV === 'test') {
			log('Using NODE_ENV: "test"');
		}
		else {
			log(
				`Overriding pre-existing NODE_ENV: ${JSON.stringify(
					NODE_ENV
				)} → "test"`
			);
		}

		spawnSync('jest', ['--config', CONFIG_PATH, ...arrArgs.slice(1)], {
			env,
		});
	}
	finally {
		dispose();
	}
};

function setBabelConfig() {
	if (fs.existsSync(CONFIG_FILE_NAME)) {
		fs.renameSync(CONFIG_FILE_NAME, PREFIX_BACKUP + CONFIG_FILE_NAME);
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

	fs.writeFileSync(
		CONFIG_FILE_NAME,
		`module.exports = ${JSON.stringify(BABEL_CONFIG, null, 2)};`
	);
}

function removeBabelConfig() {
	fs.unlinkSync(CONFIG_FILE_NAME);

	const filePath = PREFIX_BACKUP + CONFIG_FILE_NAME;

	if (fs.existsSync(filePath)) {
		fs.renameSync(filePath, CONFIG_FILE_NAME);
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
