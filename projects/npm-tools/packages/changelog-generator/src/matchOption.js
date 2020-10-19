/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {error} = require('./console');

/**
 * Checks `argument` against the supplied `matchers` object, where:
 *
 * - The keys describe option names using regular expression syntax (eg.
 *   `force|f` for boolean options, or `from=` for options that expect a
 *   parameter); and:
 * - The values are callbacks that will be notified when the argument matches
 *   the name described by the key. For boolean options the callback will
 *   receive `true` or `false`; other callbacks will receive the passed value.
 *
 * Returns `true` when the argument successfully matches and false otherwise.
 *
 * Notes:
 *
 * - Boolean options may be negated with a `--no-` prefix (eg.
 *   `--no-update-tags`).
 * - If the argument does not match any matcher, an error message is printed
 *   prompting the user to use the `--help` option (which should itself be
 *   included in the `matchers` definition).
 */
function matchOption(argument, matchers) {
	for (const [name, matcher] of Object.entries(matchers)) {
		if (name.endsWith('=')) {
			const match = new RegExp(`^(?:-{0,2})(?:${name})(.+)`, 'i').exec(
				argument
			);

			if (match) {
				matcher(match[1]);

				return true;
			}
		}
		else {
			const match = new RegExp(`^(?:-{0,2})(no-)?(?:${name})$`, 'i').exec(
				argument
			);

			if (match) {
				matcher(!match[1]);

				return true;
			}
		}
	}

	error(
		`Unrecognized argument ${argument}; see --help for available options`
	);

	return false;
}

module.exports = matchOption;
