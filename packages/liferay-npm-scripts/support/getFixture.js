/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readFile = util.promisify(fs.readFile);

async function getFixture(fixture) {
	const contents = await readFile(
		path.join(__dirname, '../__fixtures__', fixture)
	);

	return contents.toString();
}

module.exports = getFixture;
