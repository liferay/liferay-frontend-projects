/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Return negated glob or list of glob expressions.
 * @param globs list of globs or single glob expression
 * @return negated list of globs or single glob expression
 */
export function negate<T extends string | string[]>(globs: T): T {
	const negate = (glob: string) =>
		glob[0] === '!' ? glob.substring(1) : `!${glob}`;

	if (Array.isArray(globs)) {
		return globs.map(negate) as T;
	} else {
		return negate(globs as string) as T;
	}
}

/**
 * Return a list of globs prefixed with a token.
 * @param prefix the prefix to add
 * @param globs list of globs
 * @return the list of prefixed globs
 */
export function prefix(prefix: string, globs: string[]): string[] {
	return globs.map(glob => {
		if (glob[0] === '!') {
			return `!${prefix}${glob.substring(1)}`;
		} else {
			return `${prefix}${glob}`;
		}
	});
}
