/**
 * A class to help modifying the index.js file of the start script.
 */
export default class {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
		this._path = 'scripts/start/index.js';
	}

	/**
	 * Set the main module name
	 * @param {string} mainModule the main module name
	 */
	setMainModule(mainModule) {
		const gen = this._generator;

		let js = gen.fs.read(this._path);

		js = js.replace(
			/(.*)var main = require(.*);(.*)/,
			`var main = require('../../src/${mainModule}');`
		);

		gen.fs.write(this._path, js);
	}
}
