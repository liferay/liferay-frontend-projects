/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

function getFixturePath(...fixture) {
	return path.join(__dirname, '../__fixtures__', ...fixture);
}

module.exports = getFixturePath;
