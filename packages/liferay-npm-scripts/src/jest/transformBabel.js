/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const config = JSON.parse(fs.readFileSync('.babelrc').toString());

module.exports = require('babel-jest').createTransformer(config);
