/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawn-sync');

const STORYBOOK_CONFIG = getMergedConfig('npmscripts').storybook;

const PORTAL_ROOT = process.cwd().split('/modules')[0];

/**
 * Starts a storybook server for testing frontend components.
 */
module.exports = function() {
	const args = [
		'--port',
		STORYBOOK_CONFIG.port,
		'--config-dir',
		path.join(__dirname, '../storybook'),
		'--static-dir',
		PORTAL_ROOT
	];

	spawnSync('start-storybook', args);
};
