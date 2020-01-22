/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

function hasExtension(filepath, extensions) {
	const extension = path.extname(filepath).toLowerCase();

	return extensions.has(extension);
}

module.exports = hasExtension;
