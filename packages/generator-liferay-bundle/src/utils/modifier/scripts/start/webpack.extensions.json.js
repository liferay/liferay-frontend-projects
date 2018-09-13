import {JsonModifier} from '../../..';

/**
 * A class to help modifying the webpack.extensions.json file of the start
 * script.
 */
export default class extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, 'scripts/start/webpack.extensions.json');
	}

	/**
	 * Add extensions to webpack.extensions.json file.
	 * @param {Array<string>} extensions the file extensions to add
	 */
	addExtensions(...extensions) {
		this.modifyJson(json => {
			json.push(...extensions);
		});
	}
}
