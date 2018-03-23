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
	 * Log a warn message
	 * @param {String} source the identifier for the source of the message
	 * @param {Array} things the objects or strings to print
	 * @return {void}
	 */
	warn(source, ...things) {
		this._msgs.push({
			source: source,
			level: 'warn',
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
