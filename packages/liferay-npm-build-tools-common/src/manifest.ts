/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import path from 'path';

import {Manifest as Data, ModuleFlags, Package} from './api/manifest';
import PkgDesc from './pkg-desc';

export {ModuleFlags, Package};

/**
 * A class to hold information about processed modules and optionally dump/read
 * it to/from disk.
 */
export default class Manifest {
	constructor() {
		this._data = {
			packages: {},
		};
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
			dir: srcPkg.dir.asPosix,
			id: srcPkg.id,
			name: srcPkg.name,
			version: srcPkg.version,
		};

		pkg.dest = {
			dir: destPkg.dir.asPosix,
			id: destPkg.id,
			name: destPkg.name,
			version: destPkg.version,
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
	 * Save current manifest to a file
	 * @param filePath path to file
	 */
	save(filePath: string): void {
		fs.ensureDirSync(path.dirname(filePath));
		fs.writeFileSync(filePath, this.toJSON());
	}

	/**
	 * Return the JSON serialization of this manifest
	 */
	toJSON(): string {
		return JSON.stringify(this._data, sortObjectKeysReplacer, 2);
	}

	private _data: Data;
}

/**
 * Replacer function for sorting object keys when stringifying
 */
function sortObjectKeysReplacer(key: string, value: unknown): unknown {
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
