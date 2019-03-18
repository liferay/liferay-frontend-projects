/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Splits `input` at word boundaries.
 *
 * eg. "foo bar" -> ["foo", "bar"]
 *     "foo-bar" -> ["foo", "bar"]
 *     "foo_bar" -> ["foo", "bar"]
 *     "FooBar" -> ["foo", "bar"]
 */
function splitWords(input) {
	return input.trim().split(/[ _-]|(?<=[a-z])(?=[A-Z])/);
}

module.exports = splitWords;
