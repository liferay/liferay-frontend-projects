import PathResolver from './path-resolver';

/**
 * A class that calls the server to resolve module dependencies.
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
		if (modules === undefined || modules.length == 0) {
			throw new Error(`Invalid argument 'modules': ${modules}`);
		}

		const config = this._config;

		return new Promise((resolve, reject) => {
			const resolution = this._cachedResolutions[modules];

			if (resolution) {
				resolve(resolution);
				return;
			}

			fetch(
				`${config.resolvePath}?modules=` + encodeURIComponent(modules)
			)
				.then(response => response.text())
				.then(text => {
					const resolution = JSON.parse(text);
					this._cachedResolutions[modules] = resolution;
					resolve(resolution);
				})
				.catch(reject);
		});
	}
}
