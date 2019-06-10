/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const getMergedConfig = require('./getMergedConfig');
const moveToTemp = require('../utils/moveToTemp');
const removeFromTemp = require('../utils/removeFromTemp');

const BABEL_CONFIG = getMergedConfig('babel');

function setBabelConfig() {
	moveToTemp('.babelrc', 'babel');

	fs.writeFileSync('.babelrc', JSON.stringify(BABEL_CONFIG));
}

function removeBabelConfig() {
	fs.unlinkSync('.babelrc');

	removeFromTemp('.babelrc', 'babel');
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
