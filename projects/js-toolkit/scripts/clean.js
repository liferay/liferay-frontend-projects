/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const fs = require('fs-extra');
const path = require('path');

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

function clean() {
	console.log('clean:', path.basename(process.cwd()));

	try {
		const json = fs.readJSONSync('tsconfig.json');

		if (!hasValidOutDir(json)) {
			abort(
				`Invalid compilerOptions.outDir found in ` +
					`${path.basename(path.resolve('.'))}/tsconfig.json`
			);
		}

		fs.removeSync(json.compilerOptions.outDir);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			abort(error.toString());
		}
	}

	fs.removeSync('tsconfig.tsbuildinfo');
}

if (process.argv.includes('--all')) {

	// Clean all packages.

	const cwd = process.cwd();

	for (const entry of fs.readdirSync('packages', {withFileTypes: true})) {
		if (entry.isDirectory()) {
			const pkg = path.join('packages', entry.name);

			try {
				process.chdir(pkg);

				clean();
			}
			finally {
				process.chdir(cwd);
			}
		}
	}
}
else {

	// Clean just the current working directory.

	clean();
}
