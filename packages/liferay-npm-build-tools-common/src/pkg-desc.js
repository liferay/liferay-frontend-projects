/**
 * A package descriptor class to identify directories containing packages.
 * @type {PkgDesc}
 */
export default class PkgDesc {
	/**
	 * Constructor
	 * @param {String} name name of package
	 * @param {String} version version number
	 * @param {String} dir directory where package lives (or null if it is the root package)
	 * @param {Boolean} forceRoot create a root package even if dir is not null
	 */
	constructor(name, version, dir, forceRoot = false) {
		this._name = name;
		this._version = version;

		if (!dir || forceRoot) {
			this.dir = dir ? dir : '.';
			this._id = PkgDesc.ROOT_ID;
		} else {
			this.dir = dir;
			this._id = `${name}@${version}`;
		}
	}

	/**
	 * Clone this object and optionally modify some of its fields.
	 * @return {PkgDesc} a clone of this (perhaps modified) package descriptor
	 */
	clone({dir} = {}) {
		let clone = new PkgDesc(this.name, this.version, this.dir, this.isRoot);

		if (dir) {
			clone.dir = dir;
		}

		return clone;
	}

	/** eslint require-js-doc off */
	get id() {
		return this._id;
	}

	// eslint-disable-next-line require-jsdoc
	set id(id) {
		throw new Error('Package ids are read-only');
	}

	// eslint-disable-next-line require-jsdoc
	get name() {
		return this._name;
	}

	// eslint-disable-next-line require-jsdoc
	set name(name) {
		throw new Error('Package names are read-only');
	}

	// eslint-disable-next-line require-jsdoc
	get version() {
		return this._version;
	}

	// eslint-disable-next-line require-jsdoc
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
