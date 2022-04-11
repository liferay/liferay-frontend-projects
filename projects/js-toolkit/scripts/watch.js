/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const watch = require('@cnakazawa/watch');
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const getProjectDirectories = require('./util/getProjectDirectories');

/**
 * Filter file/dir paths containing static files so that they can be watched to
 * trigger `yarn copyfiles`
 *
 * @param {string} filename project relative path of file
 * @return true if the file/dir must be watched
 */
function filterStaticFiles(filename) {

	// Only watch things under 'packages'

	if (filename !== 'packages' && !filename.startsWith('packages/')) {
		return false;
	}

	const parts = filename.split(path.sep);

	// Include project subfolders

	if (parts.length < 3) {
		return true;
	}

	// Only watch files inside 'src' inside projects

	if (parts[2] !== 'src') {
		return false;
	}

	// Ignore JavaScript files

	if (filename.endsWith('.js')) {
		return false;
	}

	// Ignore TypeScript files

	if (filename.endsWith('.ts')) {
		return false;
	}

	// Ignore test files

	if (filename.includes('__tests__')) {
		return false;
	}

	return true;
}

// Watch changes to TypeScript files to trigger `tsc`

childProcess.spawn(
	'npx',
	[
		'tsc',
		'--build',
		...getProjectDirectories().map((dir) =>
			path.resolve(dir, 'tsconfig.json')
		),
		'--watch',
		'--preserveWatchOutput',
	],
	{stdio: 'inherit'}
);

// Watch changes to static files to trigger `yarn copyfiles`

watch.watchTree(
	'.',
	{filter: filterStaticFiles, ignoreDotFiles: false, interval: 1},
	(filename, curr, prev) => {
		if (
			filename !== null &&
			typeof filename === 'object' &&
			(prev === null || prev === undefined) &&
			(curr === null || curr === undefined)
		) {
			console.log(
				'Watching',
				Object.keys(filename).length,
				'static files/directories'
			);
		}
		else if (curr.nlink === 0) {

			// Removed file

		}
		else {
			const parts = filename.split(path.sep);

			parts[2] = 'lib';

			const dest = parts.join(path.sep);

			console.log('copy:', filename, '➡', dest);

			fs.writeFileSync(dest, fs.readFileSync(filename));
		}
	}
);
