/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const IGNORED_FOLDERS = [
	'archetype-resources',
	'gradleTest',
	'node_modules',
	'test',
];

module.exports = function getNpmbundlerrcFiles(dir) {
	let npmbundlerrcFiles = [];

	fs.readdirSync(dir, {withFileTypes: true}).forEach((dirent) => {
		const direntPath = path.join(dir, dirent.name);

		if (
			dirent.isDirectory() &&
			!IGNORED_FOLDERS.includes(dirent.name) &&
			!dirent.name.startsWith('.')
		) {
			npmbundlerrcFiles = [
				...npmbundlerrcFiles,
				...getNpmbundlerrcFiles(direntPath),
			];
		}
		else if (dirent.name === '.npmbundlerrc') {
			npmbundlerrcFiles.push(direntPath);
		}
	});

	return npmbundlerrcFiles;
};
