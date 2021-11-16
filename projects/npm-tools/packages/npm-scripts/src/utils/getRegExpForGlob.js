/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Helper function for scanning and consuming a "prefix" at the beginning of
 * a glob pattern.
 *
 * Returns `true` if the prefix was consumed.
 */
function scan(prefix, state) {
	if (typeof prefix === 'string') {
		if (state.input.startsWith(prefix)) {
			state.input = state.input.slice(prefix.length);
			state.lastMatch = prefix;

			return true;
		}

		return false;
	}
	else {
		let pattern = prefix.source;

		if (!pattern.startsWith('^')) {
			pattern = '^' + pattern;
		}

		const match = state.input.match(new RegExp(pattern));

		if (match) {
			state.input = state.input.slice(match[0].length);
			state.lastMatch = match[0];

			return true;
		}

		return false;
	}
}

function escape(pattern) {

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

	return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns a regular expression equivalent to the supplied `glob`.
 *
 * Semantics match those described in `man 5 gitignore`.
 */
function getRegExpForGlob(glob) {
	let pattern = '';

	const state = {
		input: glob,
		lastMatch: null,
	};

	const negated = scan('!', state);

	const anchored = scan('/', state);

	if (!anchored && !state.input.startsWith('**/')) {

		// Unless anchored, all patterns implicitly match anywhere in the
		// hierarchy.

		state.input = `**/${state.input}`;
	}

	while (state.input.length) {
		if (scan('/**/', state)) {
			pattern += '/([^/]+/)*';
		}
		else if (scan('**/', state)) {
			pattern += '([^/]+/)*';
		}
		else if (scan('/**', state)) {
			pattern += '.+';
		}
		else if (scan('**', state)) {
			pattern += '[^/]*';
		}
		else if (scan('*', state)) {
			pattern += '[^/]*';
		}
		else if (scan(/[^/*]+/, state)) {
			pattern += escape(state.lastMatch);
		}
		else if (scan('/', state)) {
			pattern += escape('/');
		}
	}

	const result = new RegExp(`^${pattern}$`);

	result.glob = glob;

	if (negated) {
		result.negated = true;
	}

	return result;
}

module.exports = getRegExpForGlob;
