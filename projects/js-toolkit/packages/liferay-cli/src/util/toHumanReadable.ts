/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * Converts a technical string to human readable form.
 */
export default function toHumanReadable(string: string): string {
	let capitalizeNext = true;
	let humanizedString = '';

	for (let i = 0; i < string.length; i++) {
		if (string[i].match(/[\\._-]/)) {
			humanizedString += ' ';
			capitalizeNext = true;
		}
		else {
			if (capitalizeNext) {
				humanizedString += string[i].toLocaleUpperCase();
				capitalizeNext = false;
			}
			else {
				humanizedString += string[i];
			}
		}
	}

	return humanizedString;
}
