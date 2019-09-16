/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

export default class FilePath {
	constructor(nativePath, {posix} = {}) {
		if (posix && !FilePath.nativeIsPosix) {
			nativePath = nativePath.replace(/\//g, '\\');
		}

		this._nativePath = nativePath;

		if (FilePath.nativeIsPosix) {
			this._posixPath = nativePath;
			this._windowsPath = nativePath.replace(/\//g, '\\');
		} else {
			this._posixPath = nativePath.replace(/\\/g, '/');
			this._windowsPath = nativePath;
		}
	}

	toString() {
		return this.asNative;
	}

	get asNative() {
		return this._nativePath;
	}

	get asPosix() {
		return this._posixPath;
	}

	get asWindows() {
		return this._windowsPath;
	}

	/**
	 *
	 * @param {...string|FilePath} nativePathFragments
	 * @return {FilePath}
	 */
	join(...nativePathFragments) {
		const join = FilePath.nativeIsPosix ? path.posix.join : path.win32.join;

		return new FilePath(
			join(
				this.toString(),
				...nativePathFragments.map(nativePathFragment =>
					nativePathFragment.toString()
				)
			)
		);
	}

	/**
	 *
	 * @param {string|FilePath} nativePath
	 * @return {FilePath}
	 */
	relative(nativePath) {
		return new FilePath(
			path.relative(this.asNative, nativePath.toString())
		);
	}
}

FilePath.nativeIsPosix = path.sep === '/';

FilePath.convertArray = (nativePathsArray, {posix} = {}) => {
	const filePathsArray = nativePathsArray.map(
		nativePath => new FilePath(nativePath, {posix})
	);

	Object.defineProperty(filePathsArray, 'asNative', {
		configurable: false,
		enumerable: true,
		get: () => filePathsArray.map(filePath => filePath.asNative),
	});

	Object.defineProperty(filePathsArray, 'asPosix', {
		configurable: false,
		enumerable: true,
		get: () => filePathsArray.map(filePath => filePath.asPosix),
	});

	Object.defineProperty(filePathsArray, 'asWindows', {
		configurable: false,
		enumerable: true,
		get: () => filePathsArray.map(filePath => filePath.asWindows),
	});

	return filePathsArray;
};
