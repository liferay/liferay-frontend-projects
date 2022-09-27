/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';

import type FilePath from 'liferay-npm-build-tools-common/lib/file-path';

export default function ({log, pkg}): void {
	if (!pkg.isRoot) {
		return;
	}

	const sourcemapFiles = findSourceMaps(project.dir.join(project.buildDir));

	if (!sourcemapFiles.length) {
		return;
	}

	for (const sourcemapFile of sourcemapFiles) {
		try {
			const sourcemap = JSON.parse(
				fs.readFileSync(sourcemapFile.asNative, 'utf-8')
			);

			const jsFileName = sourcemapFile
				.basename()
				.asNative.replace(/\.map$/, '');

			sourcemap.sources = [jsFileName];

			fs.writeFileSync(sourcemapFile.asNative, JSON.stringify(sourcemap));
		}
		catch (error) {
			log.warn(
				'tweak-sourcemaps',
				`Invalid source map file found: ${sourcemapFile.asNative}`,
				error
			);
		}
	}

	log.info(
		'tweak-sourcemaps',
		'Tweaked',
		sourcemapFiles.length,
		'source maps'
	);
}

function findSourceMaps(dir: FilePath): FilePath[] {
	const files = [];

	for (const dirent of fs.readdirSync(dir.asNative, {withFileTypes: true})) {
		const item = dirent.name;

		if (item === 'node_modules') {
			continue;
		}

		if (dirent.isDirectory()) {
			for (const child of findSourceMaps(dir.join(item))) {
				files.push(child);
			}

			continue;
		}

		if (!item.endsWith('.map')) {
			continue;
		}

		files.push(dir.join(item));
	}

	return files;
}
