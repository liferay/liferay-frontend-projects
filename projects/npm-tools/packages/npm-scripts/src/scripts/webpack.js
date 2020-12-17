/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const spawnSync = require('../utils/spawnSync');
const withTempFile = require('../utils/withTempFile');

const TWEAK_WEBPACK_CONFIG_PATH = require.resolve(
	'../utils/tweakWebpackConfig'
);
const WEBPACK_CONFIG_FILE = 'webpack.config.js';
const WEBPACK_DEV_CONFIG_FILE = 'webpack.config.dev.js';

/**
 * Main function for running webpack within the liferay-portal repo.
 */
module.exports = function (...args) {
	if (args.includes('--watch')) {
		if (!fs.existsSync(WEBPACK_DEV_CONFIG_FILE)) {
			throw new Error(
				`--watch supplied but "${WEBPACK_DEV_CONFIG_FILE}" not found`
			);
		}

		withWebpackConfig(WEBPACK_DEV_CONFIG_FILE, (configFilePath) => {
			spawnSync('webpack', [
				'serve',
				'--config',
				configFilePath,
				...args.filter((arg) => arg !== '--watch'),
			]);
		});
	}
	else {
		withWebpackConfig(WEBPACK_CONFIG_FILE, (configFilePath) => {
			spawnSync('webpack', ['--config', configFilePath, ...args]);
		});
	}
};

function escapeLiteralString(str) {
	return str.replace(/\\/g, '\\\\');
}

function withWebpackConfig(filename, callback) {
	const webpackConfigPath = path.resolve(filename);

	const webpackConfig = `
		const tweakWebpackConfig = require('${escapeLiteralString(
			TWEAK_WEBPACK_CONFIG_PATH
		)}');

		module.exports = tweakWebpackConfig('${escapeLiteralString(
			webpackConfigPath
		)}');
	`;

	withTempFile(filename, webpackConfig, callback);
}
