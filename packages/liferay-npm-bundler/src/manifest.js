import fs from 'fs';
import path from 'path';

import * as config from './config';

/**
 * A class to hold information about processed modules and optionally dump/read
 * it to/from disk.
 * @type {Manifest}
 */
export class Manifest {
	/**
	 * Constructor
	 * @param {String} filePath an optional path to a file to load initial status
	 */
	constructor(filePath = null) {
		if (filePath) {
			this._filePath = filePath;

			try {
				this._data = JSON.parse(fs.readFileSync(filePath));
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
	 * Add a processed package entry
	 * @param {PkgDesc} srcPkg the source package descriptor
	 * @param {PkgDesc} destPkg the destination package descriptor
	 */
	addPackage(srcPkg, destPkg) {
		const cwd = process.cwd();

		this._data.packages[srcPkg.id] = {
			src: {
				id: srcPkg.id,
				name: srcPkg.name,
				version: srcPkg.version,
				dir: `.${path.resolve(srcPkg.dir).substring(cwd.length)}`,
			},
			dest: {
				id: destPkg.id,
				name: destPkg.name,
				version: destPkg.version,
				dir: `.${path.resolve(destPkg.dir).substring(cwd.length)}`,
			},
		};
	}

	/**
	 * Get a processed package entry
	 * @param {PkgDesc} srcPkg the source package descriptor
	 * @return {Object} the processed package entry (see addPackage for format description)
	 */
	getPackage(srcPkg) {
		return this._data.packages[srcPkg.id];
	}

	/**
	 * Tests whether a package must be regenerated
	 * @param {PkgDesc} srcPkg the source package descriptor
	 * @return {Boolean} true if package is outdated
	 */
	isOutdated(srcPkg) {
		// Unless we use real timestamps or digests, we cannot detect reliably
		// if the root package is outdated or up-to-date.
		if (srcPkg.isRoot) {
			return true;
		}

		const entry = this._data.packages[srcPkg.id];

		if (entry === undefined) {
			return true;
		}

		if (!fs.existsSync(entry.dest.dir)) {
			return true;
		}

		return false;
	}

	/**
	 * Save current manifest to a file
	 * @param  {String} filePath path to file or null to use default path
	 * @return {void}
	 */
	save(filePath = null) {
		filePath = filePath || this._filePath;

		if (filePath === undefined) {
			throw new Error('No file path given and no default path set');
		}

		fs.writeFileSync(filePath, this.toJSON());
	}

	/**
	 * Return the JSON serialization of this manifest
	 * @return {String}
	 */
	toJSON() {
		return JSON.stringify(this._data, null, 2);
	}
}

const manifest = new Manifest(
	path.join(config.getOutputDir(), 'manifest.json')
);

export default manifest;
