/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Return negated glob or list of glob expressions.
 * @param  {String|Array} globs list of globs or single glob expression
 * @return {String|Array} negated list of globs or single glob expression
 */
export function negate(globs) {
	const negate = glob => (glob[0] === '!' ? glob.substring(1) : `!${glob}`);

	if (Array.isArray(globs)) {
		return globs.map(negate);
	} else {
		return negate(globs);
	}
}

/**
 * Return a list of globs prefixed with a token.
 * @param  {String} prefix the prefix to add
 * @param  {Array} globs list of globs
 * @return {Array} the list of prefixed globs
 */
export function prefix(prefix, globs) {
	return globs.map(glob => {
		if (glob[0] === '!') {
			return `!${prefix}${glob.substring(1)}`;
		} else {
			return `${prefix}${glob}`;
		}
	});
}
