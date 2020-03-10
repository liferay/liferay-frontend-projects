/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');
const fs = require('fs-extra');

const {abort} = require('./util/report');

function hasValidOutDir(json) {
	const {compilerOptions} = json;

	if (!compilerOptions) {
		return false;
	}

	const {outDir} = compilerOptions;

	if (!outDir) {
		return false;
	}

	const absOutDir = path.resolve(outDir);
	const projectDir = path.resolve('.');

	if (path.relative(projectDir, absOutDir).startsWith('../')) {
		return false;
	}

	return true;
}

try {
	const json = fs.readJSONSync('tsconfig.json');

	if (!hasValidOutDir(json)) {
		abort(
			`Invalid compilerOptions.outDir found in ` +
				`${path.basename(path.resolve('.'))}/tsconfig.json`
		);
	}

	fs.removeSync(json.compilerOptions.outDir);
} catch (err) {
	if (err.code !== 'ENOENT') {
		abort(err.toString());
	}
}

fs.removeSync('tsconfig.tsbuildinfo');
