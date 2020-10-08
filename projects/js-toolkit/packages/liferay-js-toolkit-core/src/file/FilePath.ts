/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

/** Alias type to be able to handle both native and FilePath arguments */
type AnyPath = string | FilePath;

export default class FilePath {
	static readonly nativeIsPosix: boolean = path.sep === '/';

	static coerce(anyPath: AnyPath): FilePath {
		return typeof anyPath === 'string' ? new FilePath(anyPath) : anyPath;
	}

	static get sep(): string {
		return FilePath.nativeIsPosix ? '/' : '\\';
	}

	constructor(nativePath: string, {posix = false}: {posix?: boolean} = {}) {
		if (posix && !FilePath.nativeIsPosix) {
			nativePath = nativePath.replace(/\//g, '\\');
		}

		this._nativePath = nativePath;

		if (FilePath.nativeIsPosix) {
			this._posixPath = nativePath;
			this._windowsPath = nativePath.replace(/\//g, '\\');
		}
		else {
			this._posixPath = nativePath.replace(/\\/g, '/');
			this._windowsPath = nativePath;
		}
	}

	toString(): string {
		return this.asNative;
	}

	get asNative(): string {
		return this._nativePath;
	}

	get asPosix(): string {
		return this._posixPath;
	}

	get asWindows(): string {
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

	isAbsolute(): boolean {
		return path.isAbsolute(this.toString());
	}

	isRelative(): boolean {
		return !this.isAbsolute();
	}

	join(...anyPathFragments: AnyPath[]): FilePath {
		const join = FilePath.nativeIsPosix ? path.posix.join : path.win32.join;

		return new FilePath(
			join(
				this.toString(),
				...anyPathFragments.map((nativePathFragment) =>
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

	/**
	 * Convert a relative path to a dot relative file path, i.e., convert '' to
	 * '.', or 'path/to/folder' to './path/to/folder' and leave
	 * '../path/to/folder' untouched.
	 *
	 * This method is primarily intended to convert file paths to local Node
	 * module names which, when required, must begin by './' or '../' to make
	 * Node treat them like locals.
	 *
	 * Other than that it is quite possible that it doesn't have a real use when
	 * dealing with the filesystem alone.
	 */
	toDotRelative(): FilePath {
		if (this.isAbsolute()) {
			throw new Error(
				'Cannot convert absolute path to dot leading local path'
			);
		}

		// Get a path like '.', '../path/to/something'  or 'path/to/something'

		let normalizedThisPath = path.normalize(this.asNative);

		if (!normalizedThisPath.startsWith('.')) {
			normalizedThisPath = `.${FilePath.sep}${normalizedThisPath}`;
		}

		return new FilePath(normalizedThisPath);
	}

	private readonly _nativePath: string;
	private readonly _posixPath: string;
	private readonly _windowsPath: string;
}
