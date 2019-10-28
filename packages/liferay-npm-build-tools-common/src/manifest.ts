/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import path from 'path';

import {Manifest as Data, ModuleFlags, Package} from './api/manifest';
import FilePath from './file-path';
import project from './project';
import PkgDesc from './pkg-desc';

export {ModuleFlags, Package};

/**
 * A class to hold information about processed modules and optionally dump/read
 * it to/from disk.
 */
export default class Manifest {
	/**
	 * @param filePath an optional path to a file to load initial status
	 */
	constructor(filePath: string = null) {
		this._loadedFromFile = false;

		if (filePath) {
			this._filePath = filePath;

			try {
				this._data = JSON.parse(fs.readFileSync(filePath));
				this._loadedFromFile = true;
				return;
			} catch (err) {
				if (err.code !== 'ENOENT') {
					throw err;
				}
			}
		}

		this._data = {
			packages: {},
		};
	}

	/**
	 * Set to true when the manifest has been loaded from a file.
	 */
	get loadedFromFile(): boolean {
		return this._loadedFromFile;
	}

	/**
	 * Add a processed package entry
	 * @param srcPkg the source package descriptor
	 * @param destPkg the destination package descriptor
	 */
	addPackage(srcPkg: PkgDesc, destPkg: PkgDesc): void {
		if (this._data.packages[srcPkg.id] === undefined) {
			this._data.packages[srcPkg.id] = {} as Package;
		}

		const pkg = this._data.packages[srcPkg.id];

		pkg.src = {
			id: srcPkg.id,
			name: srcPkg.name,
			version: srcPkg.version,
			dir: srcPkg.dir.asPosix,
		};

		pkg.dest = {
			id: destPkg.id,
			name: destPkg.name,
			version: destPkg.version,
			dir: destPkg.dir.asPosix,
		};
	}

	addModuleFlags(
		pkgId: string,
		moduleName: string,
		flags: ModuleFlags
	): void {
		if (this._data.packages[pkgId] === undefined) {
			this._data.packages[pkgId] = {} as Package;
		}

		const pkg = this._data.packages[pkgId];

		if (pkg.modules === undefined) {
			pkg.modules = {};
		}

		if (pkg.modules[moduleName] === undefined) {
			pkg.modules[moduleName] = {};
		}

		if (pkg.modules[moduleName].flags === undefined) {
			pkg.modules[moduleName].flags = {};
		}

		Object.assign(pkg.modules[moduleName].flags, flags);
	}

	/**
	 * Get a processed package entry
	 * @param srcPkg the source package descriptor
	 * @return the processed package entry (see addPackage for format description)
	 */
	getPackage(srcPkg: PkgDesc): Package {
		return this._data.packages[srcPkg.id];
	}

	/**
	 * Tests whether a package must be regenerated
	 * @param destPkg destination package
	 * @return true if package is outdated
	 */
	isOutdated(destPkg: PkgDesc): boolean {
		// Unless we use real timestamps or digests, we cannot detect reliably
		// if the root package is outdated or up-to-date.
		if (destPkg.isRoot) {
			return true;
		}

		const entry = this._data.packages[destPkg.id];

		if (entry === undefined) {
			return true;
		}

		if (
			!fs.existsSync(
				project.dir.join(new FilePath(entry.dest.dir, {posix: true}))
					.asNative
			)
		) {
			return true;
		}

		return false;
	}

	/**
	 * Save current manifest to a file
	 * @param filePath path to file or null to use default path
	 */
	save(filePath: string = null): void {
		filePath = filePath || this._filePath;

		if (filePath === undefined) {
			throw new Error('No file path given and no default path set');
		}

		fs.ensureDirSync(path.dirname(filePath));
		fs.writeFileSync(filePath, this.toJSON());
	}

	/**
	 * Return the JSON serialization of this manifest
	 */
	toJSON(): string {
		return JSON.stringify(this._data, sortObjectKeysReplacer, 2);
	}

	private _loadedFromFile: boolean;
	private _filePath: string;
	private _data: Data;
}

/**
 * Replacer function for sorting object keys when stringifying
 */
function sortObjectKeysReplacer(key, value) {
	if (value instanceof Object && !Array.isArray(value)) {
		return Object.keys(value)
			.sort()
			.reduce((sorted, key) => {
				sorted[key] = value[key];
				return sorted;
			}, {});
	} else {
		return value;
	}
}
