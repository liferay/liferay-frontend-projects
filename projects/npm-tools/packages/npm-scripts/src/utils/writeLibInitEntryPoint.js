/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

/**
 * Create a webpack entry point containing the initialization logic for
 * federation libraries.
 *
 * @param {string} filePath the path to the output file
 *
 */
module.exports = function (filePath) {
	const code = `
const { transformChunkScriptFilename } = 
	window[Symbol.for('__LIFERAY_WEBPACK_HELPERS__')];

const __saved_webpack_get_script_filename__ = __webpack_get_script_filename__;

__webpack_get_script_filename__ = (chunkId) => {
	return transformChunkScriptFilename(
		__saved_webpack_get_script_filename__(chunkId) 
	);
}
`;

	fs.writeFileSync(filePath, code);
};
