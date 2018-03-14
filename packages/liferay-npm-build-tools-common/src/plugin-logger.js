/**
 * An object to hold babel or liferay-npm-bundler plugin messages.
 * @type {PluginLogger}
 */
export default class PluginLogger {
	/**
	 * Construct empty logger with no messages
	 */
	constructor() {
		this._msgs = [];
	}

	/**
	 * Log an informational message
	 * @param {String} source the identifier for the source of the message
	 * @param {Array} things the objects or strings to print
	 * @return {void}
	 */
	info(source, ...things) {
		this._msgs.push({
			source: source,
			level: 'info',
			things: things,
		});
	}

	/**
	 * Log an error message
	 * @param {String} source the identifier for the source of the message
	 * @param {Array} things the objects or strings to print
	 * @return {void}
	 */
	error(source, ...things) {
		this._msgs.push({
			source: source,
			level: 'error',
			things: things,
		});
	}

	/**
	 * Get the list of messages
	 * @return {Array} an array containing one object per messages (with fields: source, level and things)
	 */
	get messages() {
		return this._msgs;
	}

	/**
	 * Return a printable string representation of the messages logged till now
	 * @return {String} a string containing one line per message
	 */
	toString() {
		return this._msgs.reduce(
			(str, {source, level, things}) =>
				`${str}${source}:${level}: ${things.join(' ')}\n`,
			''
		);
	}

	/**
	 * Return an HTML string representation of the messages logged till now
	 * @return {String} HTML containing one line (<br> separated) per message
	 */
	toHtml() {
		return this._msgs.reduce(
			(str, {source, level, things}) =>
				`${str}${source}:${level}: ${things.join(' ')}<br>`,
			''
		);
	}
}

global._PluginLogger_ = global._PluginLogger_ || {};

/**
 * Set the logger for a given key. This is used to pass loggers from the
 * liferay-npm-bundler core to the Babel plugins because Babel's API doesn't
 * allow any way to pass per-file custom values to plugins.
 * @param  {String} key the key to identify the logger (usually a file path)
 * @param  {PluginLogger} logger the logger
 * @return {void}
 */
PluginLogger.set = function(key, logger) {
	global._PluginLogger_[key] = logger;
};

/**
 * Get the logger for a given key. This is used to pass loggers from the
 * liferay-npm-bundler core to the Babel plugins because Babel's API doesn't
 * allow any way to pass per-file custom values to plugins.
 * @param  {String|Object} key the key to identify the logger (usually a file path). You can also pass the state object
 *  						   passed to Babel plugins and it will be automatically dereferenced.
 * @return {PluginLogger} the logger
 */
PluginLogger.get = function(key) {
	if (key.file && key.file.opts && key.file.opts.filenameRelative) {
		key = key.file.opts.filenameRelative;
	}

	return global._PluginLogger_[key] || new PluginLogger();
};

/**
 * Delete the logger for a given key. This is used to pass loggers from the
 * liferay-npm-bundler core to the Babel plugins because Babel's API doesn't
 * allow any way to pass per-file custom values to plugins.
 * @param  {String} key the key to identify the logger (usually a file path)
 * @return {void}
 */
PluginLogger.delete = function(key) {
	delete global._PluginLogger_[key];
};
