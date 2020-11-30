/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const util = require('util');

const getFixturePath = require('./getFixturePath');

const readFile = util.promisify(fs.readFile);

async function getFixture(fixture) {
	return readFile(getFixturePath(fixture), 'utf8');
}

module.exports = getFixture;
