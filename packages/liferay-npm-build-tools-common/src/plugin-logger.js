/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

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
			source,
			level: 'info',
			things,
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
			source,
			level: 'warn',
			things,
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
			source,
			level: 'error',
			things,
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
	 * Test if there are warn messages.
	 * @return {boolean} if at least one warn message is registered in the logger
	 */
	get warnsPresent() {
		return this._msgs.filter(msg => msg.level === 'warn').length > 0;
	}

	/**
	 * Test if there are error messages.
	 * @return {boolean} if at least one error message is registered in the logger
	 */
	get errorsPresent() {
		return this._msgs.filter(msg => msg.level === 'error').length > 0;
	}

	/**
	 * Return a printable string representation of the messages logged till now
	 * @return {String} a string containing one line per message
	 */
	toString() {
		return this._msgs.reduce(
			(str, {level, source, things}) =>
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
			(str, {level, source, things}) =>
				`${str}${source}:${level}: ${things.join(' ')}<br>`,
			''
		);
	}
}
