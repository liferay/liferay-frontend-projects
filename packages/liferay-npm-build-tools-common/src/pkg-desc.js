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
 * @type {PkgDesc}
 */
export default class PkgDesc {
	/**
	 * Constructor
	 * @param {String} name name of package
	 * @param {String} version version number
	 * @param {String} pkgPath directory where package lives (or null if it is
	 * 						the root package)
	 * @param {Boolean} forceRoot create a root package even if dir is not null
	 */
	constructor(name, version, pkgPath, forceRoot = false) {
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
	 * @param {FilePath|string} dir override package directory path or FilePath
	 * @return {PkgDesc} a clone of this (perhaps modified) package descriptor
	 */
	clone({dir} = {}) {
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
	 * @return {FilePath}
	 */
	get dir() {
		return this._dir;
	}

	set dir(dir) {
		throw new Error('Package dirs are read-only');
	}

	get clean() {
		return this._clean;
	}

	set clean(clean) {
		this._clean = clean;
	}

	get id() {
		return this._id;
	}

	set id(id) {
		throw new Error('Package ids are read-only');
	}

	get name() {
		return this._name;
	}

	set name(name) {
		throw new Error('Package names are read-only');
	}

	get version() {
		return this._version;
	}

	set version(version) {
		throw new Error('Package versions are read-only');
	}

	/**
	 * Test if package is the root package.
	 * @return {Boolean} true if this is the root package
	 */
	get isRoot() {
		return this.id == PkgDesc.ROOT_ID;
	}
}

PkgDesc.ROOT_ID = '/';
