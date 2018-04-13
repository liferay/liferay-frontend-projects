import {resolve} from 'path';

global._babel_ipc_ = global._babel_ipc_ || {};

/**
 * Get an IPC value for a given Babel plugin
 * @param  {Object} state babel plugin state argument
 * @param  {Object|function} defaultValue the default value or a factory to get it if value is not set
 * @return {Object} the IPC value
 */
export function get(state, defaultValue) {
	let defaultValueFactory = defaultValue;

	if (typeof defaultValue !== 'function') {
		defaultValueFactory = () => defaultValue;
	}

	if (
		!state ||
		!state.file ||
		!state.file.opts ||
		!state.file.opts.filenameRelative
	) {
		return defaultValueFactory();
	}

	const key = resolve(state.file.opts.filenameRelative);

	if (!global._babel_ipc_.hasOwnProperty(key)) {
		return defaultValueFactory();
	}

	return global._babel_ipc_[key];
}

/**
 * Set an IPC value for a given file path.
 * @param  {String} filePath the path of the file being processed
 * @param  {Object} value the IPC value to set
 * @return {void}
 */
export function set(filePath, value) {
	global._babel_ipc_[resolve(filePath)] = value;
}

/**
 * Clear an IPC value for a given file path.
 * @param  {String} filePath the path of the file being processed
 * @return {void}
 */
export function clear(filePath) {
	delete global._babel_ipc_[resolve(filePath)];
}
