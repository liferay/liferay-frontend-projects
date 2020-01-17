/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getUserConfig = require('../utils/getUserConfig');

const config = getUserConfig('babel');

module.exports = require('babel-jest').createTransformer(config);
