import PathResolver from './path-resolver';

/**
 *
 */
export default class DependencyResolver {
	/**
	 * Creates an instance of DependencyResolver class
	 * @constructor
	 * @param {Config} config
	 */
	constructor(config) {
		this._config = config;

		this._pathResolver = new PathResolver();
		this._cachedResolutions = {};
	}

	/**
	 * Resolves modules dependencies
	 * @param {array} modules list of modules which dependencies should be
	 *     						resolved
	 * @return {array} list of module names, representing module dependencies
	 *     				(module name itself is being returned too)
	 */
	resolve(modules) {
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
