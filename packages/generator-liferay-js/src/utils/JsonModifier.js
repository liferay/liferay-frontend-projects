/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A class to help modifying JSON files.
 */
export default class JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 * @param {String} path path to file
	 */
	constructor(generator, path) {
		this._generator = generator;
		this._path = path;
	}

	/**
	 * Get the JSON object associated to this modifier
	 * @return {Object} a parsed JSON object
	 */
	get json() {
		return JSON.parse(this._generator.fs.read(this._path));
	}

	/**
	 * Modify an existing JSON file.
	 * @param {Function} modifier the code that modifies the JSON (it receives a
	 * 						single parameter with the JSON object)
	 */
	modifyJson(modifier) {
		const gen = this._generator;

		const json = this.json;

		modifier(json);

		gen.fs.write(this._path, JSON.stringify(json, null, '	'));
	}

	/**
	 * Escape a property name to make it suitable for use in dot-prop
	 * @param {string} name name of property
	 * @return {string} the escaped name
	 */
	_escapeProp(name) {
		return name.replace(/\./g, '\\.');
	}
}
