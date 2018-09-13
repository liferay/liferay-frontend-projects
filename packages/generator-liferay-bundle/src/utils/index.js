import fs from 'fs';
import path from 'path';

/**
 * A class to help copying Yeoman templates.
 */
export class Copier {
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
	 */
	copyFile(src, {context = {}, dest} = {}) {
		const gen = this._generator;

		const fullContext = Object.assign({}, gen.answers);
		Object.assign(fullContext, context);

		dest = dest || src;

		gen.fs.copyTpl(
			gen.templatePath(src),
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

		files.forEach(file => {
			if (file === '.DS_Store') {
				return;
			}

			const filePath = path.join(src, file);

			if (fs.statSync(gen.templatePath(filePath)).isDirectory()) {
				this.copyDir(filePath, {context});
			} else {
				this.copyFile(filePath, {context});
			}
		});
	}
}

/**
 * A class to help modifying JSON files.
 */
export class JsonModifier {
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

		let json = this.json;

		modifier(json);

		gen.fs.write(this._path, JSON.stringify(json, null, '	'));
	}
}
