/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('./getMergedConfig');
const spawnSync = require('./spawnSync');
const withTempFile = require('./withTempFile');

/**
 * Runs liferay-npm-bundler with given args and uses a temp .npmbundlerrc file
 */
function runBundler(...args) {
	const config = getMergedConfig('bundler');

	withTempFile(
		'.npmbundlerrc',
		JSON.stringify(config),
		(npmbundlerRcPath) => {
			spawnSync('liferay-npm-bundler', [
				'--config',
				npmbundlerRcPath,
				...args,
			]);
		}
	);
}

module.exports = runBundler;
