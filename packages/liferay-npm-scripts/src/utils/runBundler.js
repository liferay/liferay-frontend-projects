/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('./getMergedConfig');
const spawnSync = require('./spawnSync');
const withTempFile = require('./withTempFile');

const BUNDLER_CONFIG = getMergedConfig('bundler');

/**
 * Runs liferay-npm-bundler with given args and uses a temp .npmbundlerrc file
 */
function runBundler(...args) {
	withTempFile(
		'.npmbundlerrc',
		JSON.stringify(BUNDLER_CONFIG),
		npmbundlerRcPath => {
			spawnSync('liferay-npm-bundler', [
				'--config',
				npmbundlerRcPath,
				...args
			]);
		}
	);
}

module.exports = runBundler;
