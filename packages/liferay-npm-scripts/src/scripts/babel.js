/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const CWD = process.cwd();

const getMergedConfig = require('../utils/get-merged-config');
const {moveToTemp, removeFromTemp} = require('../utils/move-to-temp');

const RC_PATH = path.join(CWD, '.babelrc');

const BABEL_CONFIG = getMergedConfig('babel');

exports.setBabelConfig = function() {
	moveToTemp(CWD, '.babelrc', 'babel');

	fs.writeFileSync(RC_PATH, JSON.stringify(BABEL_CONFIG));
};

exports.removeBabelConfig = function() {
	fs.unlinkSync(RC_PATH);

	removeFromTemp(CWD, '.babelrc', 'babel');
};
