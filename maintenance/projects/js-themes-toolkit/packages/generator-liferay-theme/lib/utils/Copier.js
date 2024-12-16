/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');

/**
 * A class to help copying Yeoman templates.
 */
module.exports = class Copier {

	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Instantiate a Yeoman template file.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 * @param  {String} dest optional destination name (defaults to src)
	 * @param  {boolean} rawCopy file is not a template
	 */
	copyFile(src, {context = {}, dest, rawCopy = false} = {}) {
		const gen = this._generator;

		const fullContext = {
			...gen.answers,
			...context,
		};

		dest = dest || src;

		gen.fs.copyTpl(
			gen.templatePath(rawCopy ? src : `${src}.ejs`),
			gen.destinationPath(dest),
			fullContext
		);
	}

	/**
	 * Instantiate all Yeoman template files found in a directory tree.
	 * @param  {String} src path to template
	 * @param  {Object} context optional context object to use when
	 * 						instantiating the template (defaults to {})
	 */
	copyDir(src, {context = {}} = {}) {
		const gen = this._generator;
		const files = fs.readdirSync(gen.templatePath(src));

		files.forEach((file) => {
			if (file === '.DS_Store') {
				return;
			}

			const filePath = path.join(src, file);

			if (fs.statSync(gen.templatePath(filePath)).isDirectory()) {
				this.copyDir(filePath, {context});
			}
			else {
				const rawCopy = !filePath.endsWith('.ejs');

				this.copyFile(filePath.replace(/\.ejs$/, ''), {
					context,
					rawCopy,
				});
			}
		});
	}
};
