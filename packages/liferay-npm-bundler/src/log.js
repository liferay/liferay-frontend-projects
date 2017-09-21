import { isVerbose } from './config';

/**
 * Log errors
 * @return {void}
 */
export function error(...args) {
	console.log(...args);
}

/**
 * Log message as console.log does 
 * @return {void}
 */
export function info(...args) {
	console.log(...args);
}

/**
 * Log message as console.log does but only if verbose is on
 * @return {void}
 */
export function debug(...args) {
	if (isVerbose()) {
		console.log(...args);
	}
}
