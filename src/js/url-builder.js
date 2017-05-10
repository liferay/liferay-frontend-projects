'use strict';

// External protocols regex, supports:
// "http", "https", "//" and "www."
var REGEX_EXTERNAL_PROTOCOLS = /^https?:\/\/|\/\/|www\./;

/**
 * Creates an instance of URLBuilder class.
 *
 * @constructor
 * @param {object} configParser - instance of {@link ConfigParser} object.
 */
function URLBuilder(configParser) {
	this._configParser = configParser;
}

URLBuilder.prototype = {
	constructor: URLBuilder,

	/**
     * Returns a list of URLs from provided list of modules.
     *
     * @param {array} modules List of modules for which URLs should be created.
     * @return {array} List of URLs.
     */
	build: function(modules) {
		var bufferAbsoluteURL = [];
		var bufferRelativeURL = [];
		var modulesAbsoluteURL = [];
		var modulesRelativeURL = [];
		var result = [];

		var config = this._configParser.getConfig();

		var basePath = config.basePath || '';
		var registeredModules = this._configParser.getModules();

		/* istanbul ignore else */
		if (basePath.length && basePath.charAt(basePath.length - 1) !== '/') {
			basePath += '/';
		}

		for (var i = 0; i < modules.length; i++) {
			var module = registeredModules[modules[i]];

			// If module has fullPath, individual URL have to be created.
			if (module.fullPath) {
				result.push({
					modules: [module.name],
					url: this._getURLWithParams(module.fullPath),
				});
			} else {
				var path = this._getModulePath(module);
				var absolutePath = path.indexOf('/') === 0;

				// If the URL starts with external protocol, individual URL shall be created.
				if (REGEX_EXTERNAL_PROTOCOLS.test(path)) {
					result.push({
						modules: [module.name],
						url: this._getURLWithParams(path),
					});

					// If combine is disabled, or the module is an anonymous one,
					// create an individual URL based on the config URL and module's path.
					// If the module's path starts with "/", do not include basePath in the URL.
				} else if (!config.combine || module.anonymous) {
					result.push({
						modules: [module.name],
						url: this._getURLWithParams(
							config.url + (absolutePath ? '' : basePath) + path
						),
					});
				} else {
					// If combine is true, this is not an anonymous module and the module does not have full path.
					// The module will be collected in a buffer to be loaded among with other modules from combo loader.
					// The path will be stored in different buffer depending on the fact if it is absolute URL or not.
					if (absolutePath) {
						bufferAbsoluteURL.push(path);
						modulesAbsoluteURL.push(module.name);
					} else {
						bufferRelativeURL.push(path);
						modulesRelativeURL.push(module.name);
					}
				}
			}

			module.requested = true;
		}

		// Add to the result all modules, which have to be combined.
		if (bufferRelativeURL.length) {
			result = result.concat(
				this._generateBufferURLs(
					modulesRelativeURL,
					bufferRelativeURL,
					{
						basePath: basePath,
						url: config.url,
						urlMaxLength: config.urlMaxLength,
					}
				)
			);
			bufferRelativeURL.length = 0;
		}

		if (bufferAbsoluteURL.length) {
			result = result.concat(
				this._generateBufferURLs(
					modulesAbsoluteURL,
					bufferAbsoluteURL,
					{
						url: config.url,
						urlMaxLength: config.urlMaxLength,
					}
				)
			);
			bufferAbsoluteURL.length = 0;
		}

		return result;
	},

	/**
     * Generate the appropriate set of URLs based on the list of
     * required modules and the maximum allowed URL length
     *
     * @param {Array<String>} modules Array of module names
     * @param {Array<String>} urls Array of module URLs
     * @param {Object} config Configuration object containing URL, basePath and urlMaxLength
     * @return {Array<Object>} Resulting array of {modules, url} objects
     */
	_generateBufferURLs: function(modules, urls, config) {
		var i;
		var basePath = config.basePath || '';
		var result = [];
		var urlMaxLength = config.urlMaxLength || 2000;

		var urlResult = {
			modules: [modules[0]],
			url: config.url + basePath + urls[0],
		};

		for (i = 1; i < urls.length; i++) {
			var module = modules[i];
			var path = urls[i];

			if (
				urlResult.url.length + basePath.length + path.length + 1 <
				urlMaxLength
			) {
				urlResult.modules.push(module);
				urlResult.url += '&' + basePath + path;
			} else {
				result.push(urlResult);

				urlResult = {
					modules: [module],
					url: config.url + basePath + path,
				};
			}
		}

		urlResult.url = this._getURLWithParams(urlResult.url);

		result.push(urlResult);

		return result;
	},

	/**
     * Returns the path for a module. If module has property path, it will be returned directly. Otherwise,
     * the name of module will be used and extension .js will be added to module name if omitted.
     *
     * @protected
     * @param {object} module The module which path should be returned.
     * @return {string} Module path.
     */
	_getModulePath: function(module) {
		var path = module.path || module.name;

		var paths = this._configParser.getConfig().paths || {};

		var found = false;
		Object.keys(paths).forEach(function(item) {
			/* istanbul ignore else */
			if (path === item || path.indexOf(item + '/') === 0) {
				path = paths[item] + path.substring(item.length);
			}
		});

		/* istanbul ignore else */
		if (!found && typeof paths['*'] === 'function') {
			path = paths['*'](path);
		}

		if (
			!REGEX_EXTERNAL_PROTOCOLS.test(path) &&
			path.lastIndexOf('.js') !== path.length - 3
		) {
			path += '.js';
		}

		return path;
	},

	/**
     * Returns an url with parameters defined in config.defaultURLParams. If
     * config.defaultURLParams is not defined or is an empty map, the url will
     * be returned unmodified.
     *
     * @protected
     * @param {string} url The url to be returned with parameters.
     * @return {string} url The url with parameters.
     */
	_getURLWithParams: function(url) {
		var config = this._configParser.getConfig();

		var defaultURLParams = config.defaultURLParams || {};

		var keys = Object.keys(defaultURLParams);

		if (!keys.length) {
			return url;
		}

		var queryString = keys
			.map(function(key) {
				return key + '=' + defaultURLParams[key];
			})
			.join('&');

		return url + (url.indexOf('?') > -1 ? '&' : '?') + queryString;
	},
};
