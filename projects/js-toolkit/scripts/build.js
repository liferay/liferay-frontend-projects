/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const copyfiles = require('copyfiles');
const path = require('path');

const getProjectDirectories = require('./util/getProjectDirectories');
const {runNodeBin} = require('./util/run');

function copyAssets() {
	return new Promise((resolve) => {
		console.log('copy:', path.basename(process.cwd()));

		copyfiles(
			['src/**/*', 'lib/'],
			{
				all: true,
				exclude: ['**/*.js', '**/*.ts', '**/__tests__/**/*'],
				up: 1,
			},
			(error) => {
				if (error) {
					console.error(error);
					process.exit(1);
				}

				resolve();
			}
		);
	});
}

async function main() {
	if (process.argv.includes('--all')) {
		const projectDirectories = getProjectDirectories();

		for (const projectDirectory of getProjectDirectories()) {
			process.chdir(projectDirectory);

			try {
				await copyAssets();
			}
			finally {
				process.chdir('../..');
			}
		}

		console.log('build:', path.basename(process.cwd()));

		runNodeBin.pipe(
			'tsc',
			'--build',
			...projectDirectories.map((projectDirectory) =>
				path.join(projectDirectory, 'tsconfig.json')
			)
		);
	}
	else {
		await copyAssets();

		console.log('build:', path.basename(process.cwd()));

		runNodeBin.pipe('tsc');
	}
}

main();
