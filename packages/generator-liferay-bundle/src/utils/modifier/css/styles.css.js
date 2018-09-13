/**
 * A class to help modifying the styles.css file.
 */
export default class {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		this._generator = generator;
	}

	/**
	 * Add a CSS rule to styles.css file.
	 * @param {String} selector CSS selector
	 * @param {Array} values string list of CSS attributes
	 */
	addRule(selector, ...values) {
		const gen = this._generator;

		let css = gen.fs.read('css/styles.css');

		css += `${selector} {
${values.map(value => `	${value}`).join('\n')}
}\n\n`;

		gen.fs.write('css/styles.css', css);
	}
}
