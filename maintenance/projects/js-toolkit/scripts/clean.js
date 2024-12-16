/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const abort = require('./util/abort');
const getProjectDirectories = require('./util/getProjectDirectories');

function assertValidOutDir(json) {
	const {compilerOptions} = json;

	if (!compilerOptions || !compilerOptions.outDir) {
		abort('No compilerOptions.outDir found in tsconfig.json');
	}

	const absOutDir = path.resolve(compilerOptions.outDir);
	const projectDir = path.resolve('.');

	if (path.relative(projectDir, absOutDir).startsWith('../')) {
		abort('Invalid compilerOptions.outDir found in tsconfig.json');
	}

	return true;
}

function clean(dir) {
	console.log('clean:', path.basename(dir));

	const cwd = process.cwd();

	process.chdir(dir);

	try {
		/* eslint-disable-next-line @liferay/no-dynamic-require */
		const json = require(path.resolve(dir, 'tsconfig.json'));

		assertValidOutDir(json);

		fs.rmSync(json.compilerOptions.outDir, {recursive: true});
		fs.unlinkSync(path.resolve(dir, 'tsconfig.tsbuildinfo'));
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			abort(error.toString());
		}
	}
	finally {
		process.chdir(cwd);
	}
}

if (process.argv.includes('--all')) {
	getProjectDirectories().forEach(clean);
}
else {
	clean(path.resolve('.'));
}
