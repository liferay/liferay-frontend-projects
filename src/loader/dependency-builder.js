import PathResolver from './path-resolver';

/**
 *
 */
export default class DependencyBuilder {
	/**
	 * Creates an instance of DependencyBuilder class.
	 *
	 * @constructor
	 * @param {object} configParser - instance of {@link ConfigParser} object.
	 */
	constructor(configParser) {
		this._configParser = configParser;

		this._pathResolver = new PathResolver();
		this._cachedResolutions = {};
	}

	/**
	 * Resolves modules dependencies.
	 *
	 * @param {array} modules List of modules which dependencies should be
	 *     resolved.
	 * @return {array} List of module names, representing module dependencies.
	 *     Module name itself is being returned too.
	 */
	resolveDependencies(modules) {
		return new Promise((resolve, reject) => {
			let resolution = this._cachedResolutions[modules];

			if (resolution) {
				resolve(resolution);
				return;
			}

			fetch(
				'/o/js_resolve_modules?modules=' + encodeURIComponent(modules)
			)
				.then(response => {
					response
						.text()
						.then(text => {
							const resolution = JSON.parse(text);
							this._cachedResolutions[modules] = resolution;
							resolve(resolution);
						})
						.catch(reject);
				})
				.catch(reject);
		});
	}
}
