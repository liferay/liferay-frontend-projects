/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const crypto = require('crypto');
const path = require('path');

function hashPathForVariable(filePath) {
	const normalizedFilePath = filePath.split(path.sep).join('');

	// Prefixing the string with 'a' since variables can't start with an integer

	return (
		'a' +
		crypto.createHash('sha256').update(normalizedFilePath).digest('hex')
	);
}

module.exports = hashPathForVariable;
