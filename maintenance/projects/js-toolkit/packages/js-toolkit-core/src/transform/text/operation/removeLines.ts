/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {TextTransform} from '..';

interface RemoveLinesCriteria {
	(line: string): boolean;
}

/**
 * Remove lines matching criteria from a text file
 *
 * @param lines
 */
export default function removeLines(
	criteria: RemoveLinesCriteria
): TextTransform {
	return (async (text) => {
		const lines = text.split('\n');

		return lines.filter((line) => !criteria(line)).join('\n');
	}) as TextTransform;
}
