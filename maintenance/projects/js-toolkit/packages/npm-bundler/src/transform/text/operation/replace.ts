/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {TextTransform, escapeStringRegExp} from '@liferay/js-toolkit-core';

/**
 * Replace strings or regular expressions in a text.
 *
 * @remarks
 * When `from` is a string, all occurrences of it are replaced, when it is a
 * RegExp, it depends on the 'g' flag given when constructing the RegExp.
 *
 * @param text the content to be rewritten
 * @param replacements map of replacements (key is `from`, value is `to`)
 */
export default function replace(
	replacements: Map<string | RegExp, string>
): TextTransform {
	return ((text) => {
		replacements.forEach((to, from) => {
			if (typeof from === 'string') {
				from = new RegExp(escapeStringRegExp(from), 'g');
			}

			text = text.replace(from, to);
		});

		return Promise.resolve(text);
	}) as TextTransform;
}
