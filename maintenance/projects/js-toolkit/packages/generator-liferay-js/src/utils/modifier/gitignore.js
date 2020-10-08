/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A class to help modifying the .gitignore file.
 */
export default class {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
		this._path = '.gitignore';
	}

	/**
	 * Add a line to .gitignore
	 * @param {string} line
	 */
	add(line) {
		const gen = this._generator;

		let content = gen.fs.read(this._path).toString();

		if (content.charAt(content.length - 1) !== '\n') {
			content += '\n';
		}

		content += line;

		gen.fs.write(this._path, content);
	}
}
