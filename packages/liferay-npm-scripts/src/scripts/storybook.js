/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const log = require('../utils/log');
const spawnSync = require('../utils/spawn-sync');

const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

/**
 * Starts a storybook server for testing frontend components.
 */
module.exports = function() {
	try {
		const args = [
			'--port',
			STORYBOOK_CONFIG.port,
			'--config-dir',
			STORYBOOK_CONFIG.path
		];

		spawnSync('start-storybook', args);
	} finally {
		// fs.unlinkSync(CONFIG_PATH);
	}
};
