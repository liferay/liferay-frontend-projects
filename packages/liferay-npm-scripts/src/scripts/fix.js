/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const spawnMultiple = require('../utils/spawnMultiple');
const format = require('./format');
const lint = require('./lint');

function fix() {
	spawnMultiple(() => format(), () => lint({fix: true}));
}

module.exports = fix;
