/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const spawnMultiple = require('../utils/spawnMultiple');
const preflight = require('./check/preflight');
const format = require('./format');
const lint = require('./lint');

async function check() {
	await spawnMultiple(preflight, () => format({check: true}), lint);
}

module.exports = check;
