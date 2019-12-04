/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs-extra');
const path = require('path');

const SignalHandler = require('../utils/SignalHandler');
const getMergedConfig = require('./getMergedConfig');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

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
	const tempDirPath = path.join(BUILD_CONFIG.temp, 'tmp');

	fs.ensureDirSync(tempDirPath);

	const tempFilePath = path.resolve(path.join(tempDirPath, filename));

	fs.writeFileSync(tempFilePath, content);

	const {dispose} = SignalHandler.onExit(() => {
		fs.unlinkSync(tempFilePath);
	});

	try {
		callback(tempFilePath);
	} finally {
		dispose();
	}
}

module.exports = withTempFile;
