/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs-extra');
const path = require('path');

const SignalHandler = require('../utils/SignalHandler');
const getMergedConfig = require('./getMergedConfig');

const BUILD_CONFIG = getMergedConfig('npmscripts', 'build');

/**
 * Write a temporary file that will be deleted when the tool finishes execution.
 *
 * @param {string} filename the name of the file
 * @param {string|Buffer} content content of the file
 *
 * @return {object}
 * An object with the `dispose` function (in case the caller wants to invoke it
 * before the end of the process) and the `filePath`.
 */
function createTempFile(filename, content, options) {
	options = options || {
		autoDelete: true,
	};

	const tempDirPath = path.join(BUILD_CONFIG.temp, 'tmp');

	fs.ensureDirSync(tempDirPath);

	const tempFilePath = path.resolve(path.join(tempDirPath, filename));

	fs.writeFileSync(tempFilePath, content);

	const deleteTempFile = () => {
		fs.unlinkSync(tempFilePath);
	};

	let dispose = deleteTempFile;

	if (options.autoDelete) {
		dispose = SignalHandler.onExit(deleteTempFile).dispose;
	}

	return {
		dispose,
		filePath: tempFilePath,
	};
}

module.exports = createTempFile;
