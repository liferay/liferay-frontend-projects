/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {FilePath} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const {sync: resolve} = require('resolve');

module.exports = function (url, _prev) {
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
};

function sassResolve(module) {
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

			/* eslint-disable-next-line @liferay/no-dynamic-require	*/
			const packageJson = require(resolvedPath);
			const entryPoint = packageJson.style || packageJson.main;

			return resolve(module + '/' + entryPoint, {basedir: '.'});
		}
	}
	catch (error) {
		return undefined;
	}
}

function tryImport(url, resolve) {
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
