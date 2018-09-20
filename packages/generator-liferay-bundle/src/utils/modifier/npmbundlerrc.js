import {JsonModifier} from '..';

/**
 * A class to help modifying the .npmbundlerrc file.
 */
export default class extends JsonModifier {
	/**
	 * @param {Generator} generator a Yeoman generator
	 */
	constructor(generator) {
		super(generator, '.npmbundlerrc');
	}

	/**
	 * Merge all imports contained in a JSON object into the .npmbundlerrc file.
	 * @param {Object} imports an object containing the config.imports section
	 */
	mergeImports(imports) {
		this.modifyJson(json => {
			json['config'] = json['config'] || {};
			json['config']['imports'] = json['config']['imports'] || {};

			Object.entries(imports).forEach(([provider, dependencies]) => {
				json['config']['imports'][provider] =
					json['config']['imports'][provider] || {};

				Object.entries(dependencies).forEach(([name, semver]) => {
					json['config']['imports'][provider][name] = semver;
				});
			});
		});
	}

	/**
	 * Add an exclusion to the .npmbundlerrc file.
	 * @param {string} name name of package
	 * @param {boolean} value true to exclude package
	 */
	addExclusion(name, value = true) {
		this.modifyJson(json => {
			json['exclude'] = json['exclude'] || {};
			json['exclude'][name] = value;
		});
	}
}
