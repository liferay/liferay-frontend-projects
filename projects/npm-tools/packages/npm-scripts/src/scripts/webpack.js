/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const spawnSync = require('../utils/spawnSync');
const withTempFile = require('../utils/withTempFile');

const FEDERATION_CONFIG = getMergedConfig('npmscripts', 'federation');
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

	let federation;

	if (FEDERATION_CONFIG) {
		if (typeof FEDERATION_CONFIG === 'boolean') {
			federation = '{}';
		}
		else if (typeof FEDERATION_CONFIG === 'object') {
			federation = '{\n';

			if (FEDERATION_CONFIG.main) {
				federation += `main: '${FEDERATION_CONFIG.main}'\n`;

			}

			federation += '}\n';
		}
	}

	const webpackConfig = `
		const fs = require('fs');
		const tweakWebpackConfig = require('${escapeLiteralString(
			TWEAK_WEBPACK_CONFIG_PATH
		)}');

		const webpackConfigPath = '${escapeLiteralString(webpackConfigPath)}';

		let webpackConfig;

		if (fs.existsSync(webpackConfigPath)) {
			webpackConfig = require(webpackConfigPath);
		}

		module.exports = tweakWebpackConfig(
			webpackConfig,
			{
				federation: ${federation}
			}
		);
	`;

	withTempFile(filename, webpackConfig, callback);
}
