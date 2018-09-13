import {JsonModifier} from '../../..';

/**
 * A class to help modifying the webpack.rules.json file of the start script.
 */
export default class extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, 'scripts/start/webpack.rules.json');
	}

	/**
	 * Add a rule to webpack.rules.json file.
	 * @param {RegExp} regex a regex expression to match files
	 * @param {string} loader the name of a webpack loader
	 */
	addRule(regex, loader) {
		this.modifyJson(json => {
			let test = regex.toString();

			test = test.substring(1, test.length - 1);

			json.push({
				test: test,
				use: loader,
			});
		});
	}
}
