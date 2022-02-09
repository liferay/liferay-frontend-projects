/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import {sync as resolve} from 'resolve';
import sass from 'sass';

import abort from './abort';
import findFiles from './findFiles';

const {info, print} = format;

export default function runSass(project: Project): FilePath[] {
	if (!project.srcDir) {
		return;
	}

	const scssFiles = findFiles(project.srcDir, (dirent) => {
		const lowerCaseName = dirent.name.toLowerCase();

		return (
			lowerCaseName.endsWith('.scss') && !lowerCaseName.startsWith('_')
		);
	});

	print(info`Running {sass} on ${scssFiles.length} asset files...`);

	const cssFiles: FilePath[] = [];

	scssFiles.forEach((scssFile) => {
		const assetsDirRelScssFile = project.srcDir.relative(scssFile);
		const outFile = project.build.dir.join(
			assetsDirRelScssFile.asNative.replace(/\.scss$/, '.css')
		);

		cssFiles.push(outFile);

		try {
			const {css, map} = sass.renderSync({
				file: scssFile.asNative,
				importer: sassImporter,
				outFile: outFile.asNative,
				sourceMap: true,
			});

			fs.mkdirSync(outFile.dirname().asNative, {recursive: true});

			fs.writeFileSync(outFile.asNative, css, 'utf8');

			fs.writeFileSync(`${outFile.asNative}.map`, map, 'utf8');
		}
		catch (error) {
			abort(error);
		}
	});

	return cssFiles;
}

function sassImporter(url: string): {file: string} {
	const importDir = new FilePath(this.options.file).dirname();

	let targetFile = tryImport(url, (file) => {
		const candidateFile = importDir.join(file);

		if (fs.existsSync(candidateFile.asNative)) {
			return candidateFile.asNative;
		}
	});

	if (!targetFile) {
		if (url.includes('/')) {
			targetFile = tryImport(url, (file) => sassResolve(file.asPosix));
		}
		else {
			const resolvedPath = sassResolve(url);

			if (resolvedPath) {
				targetFile = new FilePath(resolvedPath);
			}
		}
	}

	if (!targetFile) {
		targetFile = new FilePath(url, {posix: true});
	}

	return {file: targetFile.asNative};
}

function sassResolve(module: string): string {
	try {
		if (module.includes('/')) {
			return resolve(module, {basedir: '.'});
		}
		else {
			const resolvedPath = resolve(module + '/package.json', {
				basedir: '.',
			});

			if (!resolvedPath) {
				return undefined;
			}

			/* eslint-disable-next-line */
			const packageJson = require(resolvedPath);
			const entryPoint = packageJson.style || packageJson.main;

			return resolve(module + '/' + entryPoint, {basedir: '.'});
		}
	}
	catch (error) {
		return undefined;
	}
}

function tryImport(url: string, resolve: {(file: FilePath): string}): FilePath {
	const importFile = new FilePath(url, {posix: true});

	for (const prefix of ['', '_']) {
		for (const extension of ['.scss', '.sass', '.css']) {
			const candidateFile = importFile
				.dirname()
				.join(prefix + importFile.basename() + extension);

			const resolvedPath = resolve(candidateFile);

			if (resolvedPath) {
				return new FilePath(resolvedPath);
			}
		}
	}
}
