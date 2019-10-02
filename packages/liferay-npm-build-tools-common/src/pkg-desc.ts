/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import FilePath from './file-path';
import project from './project';

/**
 * A package descriptor class to identify directories containing packages.
 */
export default class PkgDesc {
	/** Well known id for the root package */
	static readonly ROOT_ID = '/';

	/**
	 * @param name name of package
	 * @param version version number
	 * @param pkgPath directory where package lives (or null if it is the root
	 * 					package)
	 * @param forceRoot create a root package even if dir is not null
	 */
	constructor(
		name: string,
		version: string,
		pkgPath: string,
		forceRoot: boolean = false
	) {
		this._name = name;
		this._version = version;

		if (!pkgPath) {
			pkgPath = project.dir.asNative;
			this._id = PkgDesc.ROOT_ID;
		} else if (forceRoot) {
			this._id = PkgDesc.ROOT_ID;
		} else {
			this._id = `${name}@${version}`;
		}

		let pkgPrjRelPath = project.dir.relative(pkgPath).asNative;

		// Because path.join('.', 'x') returns 'x', not './x' we need to prepend
		// './' by hand :-(
		pkgPrjRelPath =
			pkgPrjRelPath === '' ? '.' : `.${path.sep}${pkgPrjRelPath}`;

		this._dir = new FilePath(pkgPrjRelPath);

		this._clean = true;
	}

	/**
	 * Clone this object and optionally modify some of its fields.
	 * @param dir override package directory path or FilePath
	 * @return a clone of this (perhaps modified) package descriptor
	 */
	clone({dir}: {dir?: FilePath | string} = {}): PkgDesc {
		return new PkgDesc(
			this.name,
			this.version,
			dir ? dir.toString() : this._dir.toString(),
			this.isRoot
		);
	}

	/**
	 * Get directory where package lives referenced to `project.dir`. Note that
	 * it always start with `./` so that it can be used in `path.join()` calls.
	 */
	get dir(): FilePath {
		return this._dir;
	}

	get clean(): boolean {
		return this._clean;
	}

	set clean(clean: boolean) {
		this._clean = clean;
	}

	get id(): string {
		return this._id;
	}

	get name(): string {
		return this._name;
	}

	get version(): string {
		return this._version;
	}

	get isRoot(): boolean {
		return this.id == PkgDesc.ROOT_ID;
	}

	private _clean: boolean;
	private readonly _dir: FilePath;
	private readonly _id: string;
	private readonly _name: string;
	private readonly _version: string;
}
