/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');

try {
	const json = fs.readJSONSync('tsconfig.json');

	if (json.compilerOptions && json.compilerOptions.outDir) {
		fs.removeSync(json.compilerOptions.outDir);
	}
} catch (err) {
	if (err.code !== 'ENOENT') {
		throw err;
	}
}
