/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const copyfiles = require('copyfiles');
const path = require('path');

const abort = require('./util/abort');
const getProjectDirectories = require('./util/getProjectDirectories');
const spawn = require('./util/spawn');

function compile(dir) {
	try {
		spawn('yarn', ['run', 'tsc'], {cwd: dir});
	}
	catch (error) {
		throw new Error(
			`Compilation failed for project: ${path.basename(dir)}`
		);
	}
}

async function copyAssets(dir) {
	return new Promise((resolve) => {
		const dirUp = dir.split(path.sep).length;

		copyfiles(
			[`${dir}/src/**/*`, `${dir}/lib/`],
			{
				all: true,
				exclude: ['**/*.js', '**/*.ts', '**/__tests__/**/*'],
				up: dirUp + 1,
			},
			(error) => {
				if (error) {
					abort(error);
				}

				resolve();
			}
		);
	});
}

async function build(dir) {
	try {
		console.log('copy:', path.basename(dir));

		await copyAssets(dir);

		console.log('compile:', path.basename(dir));

		compile(dir);
	}
	catch (error) {
		abort(error.toString());
	}
}

(async () => {
	if (process.argv.includes('--all')) {
		for (const projectDir of getProjectDirectories()) {
			await build(projectDir);
		}
	}
	else {
		build(path.resolve('.'));
	}
})();
