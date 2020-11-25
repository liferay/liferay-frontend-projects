/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const createTempFile = require('./createTempFile');

/**
 * Execute a block of code after writing a temporary file. The function ensures
 * that the temporary file is deleted after the block execution (which is
 * assumed to be synchronous).
 *
 * @param {string} filename
 * The name of the file.
 *
 * @param {string|Buffer} content
 * Content of the file.
 *
 * @param {function} callback
 * The code to execute.
 */
function withTempFile(filename, content, callback) {
	const {dispose, filePath} = createTempFile(filename, content);

	try {
		callback(filePath);
	}
	finally {
		dispose();
	}
}

module.exports = withTempFile;
