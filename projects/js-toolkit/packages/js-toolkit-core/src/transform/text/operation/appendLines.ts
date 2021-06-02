/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {TextTransform} from '..';

/**
 * Add a bunch of lines to a text file
 *
 * @param lines
 */
export default function appendLines(...lines: string[]): TextTransform {
	return (async (text) => {
		return text + '\n' + lines.join('\n');
	}) as TextTransform;
}
