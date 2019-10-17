/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

/** Alias type to be able to handle both native and FilePath arguments */
export type AnyPath = string | FilePath;

export default class FilePath {
	static readonly nativeIsPosix: boolean = path.sep === '/';

	constructor(nativePath: string, {posix = false}: {posix?: boolean} = {}) {
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

	basename(): FilePath {
		return new FilePath(path.basename(this.asNative));
	}

	dirname(): FilePath {
		return new FilePath(path.dirname(this.asNative));
	}

	is(anyPath: AnyPath): boolean {
		if (typeof anyPath === 'string') {
			anyPath = new FilePath(anyPath);
		}

		return anyPath.resolve().asNative === this.resolve().asNative;
	}

	join(...anyPathFragments: AnyPath[]): FilePath {
		const join = FilePath.nativeIsPosix ? path.posix.join : path.win32.join;

		return new FilePath(
			join(
				this.toString(),
				...anyPathFragments.map(nativePathFragment =>
					nativePathFragment.toString()
				)
			)
		);
	}

	normalize(): FilePath {
		return new FilePath(path.normalize(this.asNative));
	}

	relative(anyPath: AnyPath): FilePath {
		return new FilePath(path.relative(this.asNative, anyPath.toString()));
	}

	resolve(): FilePath {
		const resolvedPath = path.resolve(this.asNative);

		if (resolvedPath === this.asNative) {
			return this;
		}

		return new FilePath(resolvedPath);
	}

	private readonly _nativePath: string;
	private readonly _posixPath: string;
	private readonly _windowsPath: string;
}
