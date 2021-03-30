/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

function color(name) {
	if (process.stdout.isTTY) {
		return (
			{
				BOLD: '\x1b[1m',
				RED: '\x1b[31m',
				RESET: '\x1b[0m',
				UNDERLINE: '\x1b[4m',
				YELLOW: '\x1b[33m',
			}[name] || ''
		);
	}
	else {
		return '';
	}
}

color.BOLD = color('BOLD');
color.RED = color('RED');
color.RESET = color('RESET');
color.UNDERLINE = color('UNDERLINE');
color.YELLOW = color('YELLOW');

module.exports = color;
