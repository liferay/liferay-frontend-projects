/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('./get-merged-config');
const {moveToTemp, removeFromTemp} = require('./move-to-temp');

const BABEL_CONFIG = getMergedConfig('babel');
const CWD = process.cwd();
const RC_PATH = path.join(CWD, '.babelrc');

function setBabelConfig() {
	moveToTemp(CWD, '.babelrc', 'babel');

	fs.writeFileSync(RC_PATH, JSON.stringify(BABEL_CONFIG));
}

function removeBabelConfig() {
	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.babelrc', 'babel');
}

/**
 * Configures the Babel environment, executes `callback` (which is expected to
 * be synchronous), and then restores the Babel environment to its original
 * state.
 */
function withBabelConfig(callback) {
	try {
		setBabelConfig();

		callback();
	} finally {
		removeBabelConfig();
	}
}

module.exports = withBabelConfig;
