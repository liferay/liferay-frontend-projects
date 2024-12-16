/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A class to help modifying the styles.css file.
 */
export default class {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
		this._path = 'assets/css/styles.css';
	}

	/**
	 * Add a CSS rule to styles.css file.
	 * @param {String} selector CSS selector
	 * @param {Array} values string list of CSS attributes
	 */
	addRule(selector, ...values) {
		const gen = this._generator;

		let css = gen.fs.read(this._path);

		css += `${selector} {
${values.map((value) => `	${value}`).join('\n')}
}\n\n`;

		gen.fs.write(this._path, css);
	}
}
